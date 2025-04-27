from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
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

def transfer_tokens(sender_seed, destination_address, amount, currency, issuer_address):
    client = JsonRpcClient("https://s.altnet.rippletest.net:51234")  # Testnet
    sender_wallet = Wallet(seed=sender_seed, sequence=None)
    
    payment_tx = Payment(
        account=sender_wallet.classic_address,
        destination=destination_address,
        amount={
            "currency": currency,
            "value": str(amount),
            "issuer": issuer_address
        }
    )
    
    response = safe_sign_and_submit_transaction(payment_tx, sender_wallet, client)
    print(f"Transaction Response type: {type(response)}")
    print(f"Transaction Response: {response}")
    if response.status != "success" or response.result.get("engine_result") != "tesSUCCESS":
        raise Exception(f"Transaction submission failed: {response.result.get('engine_result_message', 'Unknown error')}")
    tx_hash = response.result['tx_json']['hash']
    tx_result = wait_for_transaction_confirmation(client, tx_hash)
    return tx_result

if __name__ == "__main__":
    sender_seed = "sEdTxYqTkMrTZGczJAwkFBxL9mt76wk"  # Test wallet seed
    destination_address = "rQDmTszDNPZB2Bec8vELb9uGgYiBsdDkHS"  # Issuer address
    amount = 1000000000  # Transfer all 1 billion MNX tokens
    currency = "MNX"
    issuer_address = "rQDmTszDNPZB2Bec8vELb9uGgYiBsdDkHS"
    try:
        result = transfer_tokens(sender_seed, destination_address, amount, currency, issuer_address)
        print("Tokens Transferred Successfully:")
        print(result)
    except Exception as e:
        print(f"Error transferring tokens: {e}")
