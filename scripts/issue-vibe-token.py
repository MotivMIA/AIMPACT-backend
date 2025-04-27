from xrpl.clients import JsonRpcClient
  from xrpl.wallet import Wallet
  from xrpl.models.transactions import Payment
  from xrpl.utils import get_transaction_from_hash

  def issue_token(issuer_seed, destination_address, currency="VIBE", amount="1000000"):
      client = JsonRpcClient("wss://s.altnet.rippletest.net:51233")  # Testnet
      issuer_wallet = Wallet(seed=issuer_seed, sequence=None)
      
      payment_tx = Payment(
          account=issuer_wallet.classic_address,
          destination=destination_address,
          amount={
              "currency": currency,
              "value": amount,
              "issuer": issuer_wallet.classic_address
          }
      )
      
      response = client.submit_and_wait(payment_tx, wallet=issuer_wallet)
      tx_hash = response.result['tx_json']['hash']
      tx_result = get_transaction_from_hash(tx_hash, client)
      return tx_result

  if __name__ == "__main__":
      issuer_seed = "sEd7ahMHwHhigKGDaVStMs6eoL86i4z"
      destination_address = "rB8Ay3PoAF1tkMJE3gVv2PTPhwAvabxaux"
      try:
          result = issue_token(issuer_seed, destination_address)
          print("Token Issued Successfully:")
          print(result)
      except Exception as e:
          print(f"Error issuing token: {e}")
