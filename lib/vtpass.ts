import axios from "axios";

// This points to your Node.js Proxy to avoid CORS "Network Errors"
const PROXY_URL = "https://callondemand-backend.onrender.com/api/vtpass";

/**
 * GENERATE REQUEST ID
 * Format: YYYYMMDDHHII + 5 random alphanumeric characters
 * Mandatory requirement for VTpass transaction tracking.
 */
function generateRequestId(): string {
  const now = new Date();
  
  // VTpass expects the date in WAT (Nigeria Time). 
  // If your local machine is off, it fails. 
  // This approach builds the string safely.
  const datePart = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0');
  
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();

  return datePart + randomPart;
}
// ======================== TYPES ========================

export type DataPlan = {
  name: string;
  variation_code: string;
  variation_amount: string;
};

// ======================== PROXIED FUNCTIONS ========================

/**
 * BUY AIRTIME
 */
export async function buyAirtime(payload: { serviceID: string, amount: number, phone: string }) {
  const request_id = generateRequestId();
  try {
    const res = await axios.post(`${PROXY_URL}/pay`, { ...payload, request_id });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Airtime service unavailable");
  }
}

/**
 * FETCH DATA PLANS
 * Uses the proxy to fetch variations for a specific network
 */
export async function getDataPlans(serviceID: string): Promise<DataPlan[]> {
  try {
    const res = await axios.post(`${PROXY_URL}/variations`, { serviceID });
    // VTpass returns variations inside the content object
    return res.data?.content?.variations || res.data?.content?.varations || [];
  } catch (err: any) {
    console.error("VTpass Fetch Plans Error:", err.message);
    throw new Error("Failed to load data plans");
  }
}

/**
 * BUY DATA BUNDLE
 */
export async function buyData(payload: { 
  serviceID: string, 
  billersCode: string, 
  variation_code: string, 
  amount: number, 
  phone: string 
}) {
  const request_id = generateRequestId();
  try {
    const res = await axios.post(`${PROXY_URL}/pay`, { ...payload, request_id });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Data subscription failed");
  }
}

/**
 * VERIFY METER NUMBER (Electricity)
 */
export async function verifyMeterNumber(payload: { 
  serviceID: string, 
  billersCode: string, 
  type: string 
}) {
  try {
    const res = await axios.post(`${PROXY_URL}/verify`, payload);
    if (res.data?.content?.Customer_Name) return res.data.content;
    throw new Error(res.data?.response_description || "Verification failed");
  } catch (err: any) {
    throw new Error("Invalid Meter Number or Service unavailable");
  }
}

/**
 * BUY ELECTRICITY TOKEN
 */
export async function buyElectricity(payload: {
  serviceID: string,
  billersCode: string,
  variation_code: "prepaid" | "postpaid",
  amount: number,
  phone: string
}) {
  const request_id = generateRequestId();
  try {
    const res = await axios.post(`${PROXY_URL}/pay`, { ...payload, request_id });
    return res.data;
  } catch (err: any) {
    throw new Error("Electricity payment failed. Try again later.");
  }
}

/**
 * BUY EDUCATION PINS (WAEC/JAMB)
 */
export async function buyEducation(payload: { serviceID: string, quantity: number, amount: number, phone: string }) {
  const request_id = generateRequestId();
  const body = { ...payload, variation_code: payload.serviceID, request_id };
  try {
    const res = await axios.post(`${PROXY_URL}/pay`, body);
    return res.data;
  } catch (err: any) {
    throw new Error("Education pin purchase failed");
  }
}

/**
 * REQUERY TRANSACTION
 * Manual status check for pending (099) transactions
 */
export async function queryTransactionStatus(request_id: string) {
  try {
    const res = await axios.post(`${PROXY_URL}/requery`, { request_id });
    return res.data;
  } catch (err: any) {
    console.error("VTpass Requery Error:", err.message);
    throw new Error("Failed to verify transaction status");
  }
}