import API from "../api/axios";

// GET ALL TRANSACTIONS — passes date range to backend as query params
// Backend should read ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
export const getAllTransactions = async (startDate = "", endDate = "") => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate)   params.end_date   = endDate;

    const res = await API.get(import.meta.env.VITE_EASYBUZZ_TRANSACTION_API, {
      params,
    });
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
