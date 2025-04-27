from flask import Flask, request, jsonify
from flask_cors import CORS
import xrpl
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
from xrpl.models.requests import Tx
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/account_info', methods=['GET'])
def account_info():
    try:
        account = request.args.get('account')
        if not account:
            return jsonify({"error": "Account parameter is required"}), 400
        client = JsonRpcClient("wss://s.altnet.rippletest.net:51233")
        response = client.request({
            "command": "account_info",
            "account": account
        })
        return jsonify(response.result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/account_lines', methods=['GET'])
def account_lines():
    try:
        account = request.args.get('account')
        if not account:
            return jsonify({"error": "Account parameter is required"}), 400
        client = JsonRpcClient("wss://s.altnet.rippletest.net:51233")
        response = client.request({
            "command": "account_lines",
            "account": account,
            "ledger_index": "validated"
        })
        return jsonify(response.result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/process_payment', methods=['POST'])
def process_payment():
    try:
        data = request.get_json()
        account = data.get('account')
        amount = data.get('amount')
        fee = data.get('fee')
        fee_wallet = data.get('feeWallet')
        if not account or not amount or not fee or not fee_wallet:
            return jsonify({"error": "Missing required parameters"}), 400

        client = JsonRpcClient("wss://s.altnet.rippletest.net:51233")
        issuer_seed = os.getenv("ISSUER_SEED")
        if not issuer_seed:
            return jsonify({"error": "Issuer seed not configured"}), 500
        issuer_wallet = Wallet(seed=issuer_seed, sequence=None)

        # Send tokens to user
        payment_tx = Payment(
            account=issuer_wallet.classic_address,
            destination=account,
            amount={
                "currency": "VIBE",
                "value": str(amount),
                "issuer": issuer_wallet.classic_address
            }
        )
        response = client.submit_and_wait(payment_tx, wallet=issuer_wallet)
        tx_hash = response.result['tx_json']['hash']
        # Fetch transaction details
        tx_result = client.request(Tx(transaction=tx_hash))

        # Send fee to fee wallet
        fee_tx = Payment(
            account=issuer_wallet.classic_address,
            destination=fee_wallet,
            amount={
                "currency": "VIBE",
                "value": str(fee),
                "issuer": issuer_wallet.classic_address
            }
        )
        fee_response = client.submit_and_wait(fee_tx, wallet=issuer_wallet)
        fee_tx_hash = fee_response.result['tx_json']['hash']
        # Fetch fee transaction details
        fee_tx_result = client.request(Tx(transaction=fee_tx_hash))

        return jsonify({"status": "success", "tx_hash": tx_hash, "fee_tx_hash": fee_tx_hash}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
