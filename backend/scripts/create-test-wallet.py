from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet

def create_test_wallet():
    client = JsonRpcClient("wss://s.altnet.rippletest.net:51233")  # Testnet
    wallet = generate_faucet_wallet(client)
    return {
        "address": wallet.classic_address,
        "seed": wallet.seed
    }

if __name__ == "__main__":
    try:
        wallet_info = create_test_wallet()
        print("Test Wallet Created Successfully:")
        print(f"Address: {wallet_info['address']}")
        print(f"Seed: {wallet_info['seed']}")
    except Exception as e:
        print(f"Error creating test wallet: {e}")
