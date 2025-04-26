from flask import Flask, request, jsonify
import xrpl
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True)
