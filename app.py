from flask import Flask, request, jsonify
from flask_cors import CORS
import xrpl
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
from xrpl.models.requests import Tx
from xrpl.models.amounts import IssuedCurrencyAmount
from xrpl.transaction import safe_sign_and_submit_transaction
import os
import time

app = Flask(__name__)
CORS(app)

@app.route('/api/account_info', methods=['GET'])
def account_info():
    try:
        account = request.args.get('account')
        if not account:
            return jsonify({"error": "Account parameter is required"}), 400
        client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
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
        client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
        response = client.request({
            "command": "account_lines",
            "account": account,
            "ledger_index": "validated"
        })
        return jsonify(response.result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def wait_for_transaction_confirmation(client, tx_hash, max_attempts=30, delay=2):
    """Poll the ledger until the transaction is validated or max attempts are reached."""
    for _ in range(max_attempts):
        try:
            response = client.request(Tx(transaction=tx_hash))
            if response.is_successful() and response.result.get("validated", False):
                return response
        except Exception as e:
            pass
        time.sleep(delay)
    raise Exception("Transaction not validated within the expected time")

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

        client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
        issuer_seed = os.getenv("ISSUER_SEED")
        if not issuer_seed:
            return jsonify({"error": "Issuer seed not configured"}), 500
        issuer_wallet = Wallet(seed=issuer_seed, sequence=None)

        # Send tokens to user
        payment_amount = IssuedCurrencyAmount(
            currency="VIP",
            value=str(amount),
            issuer=issuer_wallet.classic_address
        )
        payment_tx = Payment(
            account=issuer_wallet.classic_address,
            destination=account,
            amount=payment_amount
        )
        response = safe_sign_and_submit_transaction(payment_tx, issuer_wallet, client)
        tx_hash = response.result['tx_json']['hash']
        # Wait for transaction confirmation
        tx_result = wait_for_transaction_confirmation(client, tx_hash)

        # Send fee to fee wallet
        fee_amount = IssuedCurrencyAmount(
            currency="VIP",
            value=str(fee),
            issuer=issuer_wallet.classic_address
        )
        fee_tx = Payment(
            account=issuer_wallet.classic_address,
            destination=fee_wallet,
            amount=fee_amount
        )
        fee_response = safe_sign_and_submit_transaction(fee_tx, issuer_wallet, client)
        fee_tx_hash = fee_response.result['tx_json']['hash']
        # Wait for fee transaction confirmation
        fee_tx_result = wait_for_transaction_confirmation(client, fee_tx_hash)

        return jsonify({"status": "success", "tx_hash": tx_hash, "fee_tx_hash": fee_tx_hash}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
