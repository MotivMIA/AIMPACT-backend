from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import TrustSet
from xrpl.transaction import safe_sign_and_submit_transaction
import time

def wait_for_transaction_confirmation(client, tx_hash, max_attempts=30, delay=2):
    """Poll the ledger until the transaction is validated or max attempts are reached."""
    for _ in range(max_attempts):
        try:
            response = client.request({
                "command": "tx",
                "transaction": tx_hash
            })
            if response.is_successful() and response.result.get("validated", False):
                return response
        except Exception as e:
            pass
        time.sleep(delay)
    raise Exception("Transaction not validated within the expected time")

def create_trust_line(issuer_address, test_wallet_seed, currency="VIP", limit="1000000"):
    client = JsonRpcClient("https://s.altnet.rippletest.net:51234")  # Testnet
    test_wallet = Wallet(seed=test_wallet_seed, sequence=None)
    
    trust_set_tx = TrustSet(
        account=test_wallet.classic_address,
        limit_amount={
            "currency": currency,
            "issuer": issuer_address,
            "value": limit
        }
    )
    
    response = safe_sign_and_submit_transaction(trust_set_tx, test_wallet, client)
    tx_hash = response.result['tx_json']['hash']
    tx_result = wait_for_transaction_confirmation(client, tx_hash)
    return tx_result

if __name__ == "__main__":
    issuer_address = "rQDmTszDNPZB2Bec8vELb9uGgYiBsdDkHS"
    test_wallet_seed = "sEdTxYqTkMrTZGczJAwkFBxL9mt76wk"
    try:
        result = create_trust_line(issuer_address, test_wallet_seed)
        print("Trust Line Created Successfully:")
        print(result)
    except Exception as e:
        print(f"Error creating trust line: {e}")
