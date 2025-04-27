from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import TrustSet
from xrpl.models.requests import Tx
from xrpl.transaction import safe_sign_and_submit_transaction
import time

def wait_for_transaction_confirmation(client, tx_hash, max_attempts=30, delay=2):
    """Poll the ledger until the transaction is validated or max attempts are reached."""
    for attempt in range(max_attempts):
        try:
            response = client.request(Tx(transaction=tx_hash))
            print(f"Attempt {attempt + 1}: Response type: {type(response)}")
            print(f"Attempt {attempt + 1}: Response: {response}")
            if response.status == "success":
                result = response.result
                if result.get("validated", False):
                    return result
                elif "error" in result:
                    raise Exception(f"Transaction failed: {result.get('error')}")
            else:
                print(f"Attempt {attempt + 1}: Request failed with status: {response.status}")
        except Exception as e:
            print(f"Attempt {attempt + 1}: Error fetching transaction: {str(e)}")
            import traceback
            traceback.print_exc()
        time.sleep(delay)
    raise Exception("Transaction not validated within the expected time")

def remove_trust_line(issuer_address, test_wallet_seed, currency="MNX"):
    client = JsonRpcClient("https://s.altnet.rippletest.net:51234")  # Testnet
    test_wallet = Wallet(seed=test_wallet_seed, sequence=None)
    
    trust_set_tx = TrustSet(
        account=test_wallet.classic_address,
        limit_amount={
            "currency": currency,
            "issuer": issuer_address,
            "value": "0"  # Setting limit to 0 removes the trust line
        }
    )
    
    response = safe_sign_and_submit_transaction(trust_set_tx, test_wallet, client)
    print(f"Transaction Response type: {type(response)}")
    print(f"Transaction Response: {response}")
    if response.status != "success" or response.result.get("engine_result") != "tesSUCCESS":
        raise Exception(f"Transaction submission failed: {response.result.get('engine_result_message', 'Unknown error')}")
    tx_hash = response.result['tx_json']['hash']
    tx_result = wait_for_transaction_confirmation(client, tx_hash)
    return tx_result

if __name__ == "__main__":
    issuer_address = "rQDmTszDNPZB2Bec8vELb9uGgYiBsdDkHS"
    test_wallet_seed = "sEdTxYqTkMrTZGczJAwkFBxL9mt76wk"
    try:
        result = remove_trust_line(issuer_address, test_wallet_seed)
        print("Trust Line Removed Successfully:")
        print(result)
    except Exception as e:
        print(f"Error removing trust line: {e}")
