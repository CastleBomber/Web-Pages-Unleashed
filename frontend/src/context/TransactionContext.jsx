import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { parseEther, Contract, formatEther } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
const { ethereum } = window;
export const TransactionContext = React.createContext();

const getEthereumContract = () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(""); // defaultAccount, setDefaultAccount
  const [userBalance, setUserBalance] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) {
        return alert("Please install metamask");
      }

      const transactionContract = getEthereumContract();

      const availableTransactions =
        await transactionContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        })
      );

      console.log(structuredTransactions);

      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        return alert("Please install metamask");
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getUserBalance(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object in checkIfWalletIsConnected()");
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object in checkIfTransactionsExist()");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("please install metamask");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      getUserBalance(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("please install metamask");

      const { addressTo, amount } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = parseEther(amount); // Converts (Decimal) amount to wei

      console.log(`Parsed Amount in wei: ${parsedAmount.toString()}`);

      const txParams = {
        from: currentAccount,
        to: addressTo,
        gas: "0x5208", // 21000 GWEI
        value: parsedAmount.toString(), // value in wei
      };

      console.log(`Transaction Parameters:`, txParams);

      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      console.log(`Transaction Hash from eth_sendTransaction: ${txHash}`);

      console.log(
        `Loading - Before transactionHash = await transactionContract.addToBlockChain()`
      );
      const transactionHash = await transactionContract.addToBlockChain(
        addressTo,
        parsedAmount
      );
      console.log(
        `Loading - After transactionHash = await transactionContract.addToBlockChain()`
      );

      setIsLoading(true);
      console.log(`Loading - Transaction Hash: ${transactionHash.hash}`);
      await transactionHash.wait();
      console.log(`Success - Transaction Hash: ${transactionHash.hash}`);
      setIsLoading(false);

      const transactionCount = await transactionContract.getTransactionCount();
      console.log(`Transaction Count: ${transactionCount.toNumber()}`);
      setTransactionCount(transactionCount.toNumber());

      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const accountChanged = (accountName) => {
    setCurrentAccount(accountName);
    getUserBalance(accountName);
  };

  const getUserBalance = async (accountAddress) => {
    try {
      const balance = await ethereum.request({
        method: "eth_getBalance",

        params: [accountAddress, "latest"],
      });

      setUserBalance(formatEther(balance));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    //checkIfTransactionsExist();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        userBalance,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
        transactionCount,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
