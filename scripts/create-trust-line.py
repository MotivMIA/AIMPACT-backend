from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import TrustSet
from xrpl.utils import get_transaction_from_hash

def create_trust_line(issuer_address, test_wallet_seed, currency="VIB", limit="1000000"):
    client = JsonRpcClient("wss://s.altnet.rippletest.net:51233")  # Testnet
    test_wallet = Wallet(seed=test_wallet_seed, sequence=None)
    
    trust_set_tx = TrustSet(
        account=test_wallet.classic_address,
        limit_amount={
            "currency": currency,
            "issuer": issuer_address,
            "value": limit
        }
    )
    
    response = client.submit_and_wait(trust_set_tx, wallet=test_wallet)
    tx_hash = response.result['tx_json']['hash']
    tx_result = get_transaction_from_hash(tx_hash, client)
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