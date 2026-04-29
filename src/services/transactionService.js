import API from "../api/axios";

// GET ALL TRANSACTIONS (Easybuzz payment history for all orders)
export const getAllTransactions = async () => {
  try {
    const res = await API.get(import.meta.env.VITE_EASYBUZZ_TRANSACTION_API);
    return res.data;
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return [];
  }
};

// GET SINGLE TRANSACTION DETAIL BY txnid
export const getTransactionById = async (txnid) => {
  try {
    const res = await API.get(
      `${import.meta.env.VITE_EASYBUZZ_TRANSACTION_API}/${txnid}`
    );
    return res.data;
  } catch (err) {
    console.error("Transaction detail fetch error:", err);
    return null;
  }
};
