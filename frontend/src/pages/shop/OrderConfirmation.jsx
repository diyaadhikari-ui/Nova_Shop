import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import api from "../../services/api";

const OrderConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOrderConfirmation = async () => {
      const esewaData = searchParams.get("data");
      const stripeStatus = searchParams.get("stripe");

      try {
        setLoading(true);
        setErrorMessage("");

        if (esewaData) {
          await verifyEsewaPayment(esewaData);
          return;
        }

        if (stripeStatus === "success" && id) {
          await confirmStripePayment(id);
          return;
        }

        if (id) {
          await fetchOrder(id);
          return;
        }

        setErrorMessage("Order ID was not found.");
      } catch (error) {
        console.error("Order confirmation error:", error);
        setErrorMessage(
          error?.response?.data?.message ||
            "Unable to load the order confirmation."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrderConfirmation();
  }, [id, searchParams]);

  const fetchOrder = async (orderId) => {
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    try {
      const response = await api.get(`/orders/${orderId}`);

      const fetchedOrder =
        response?.data?.order || response?.data || null;

      setOrder(fetchedOrder);

      if (!fetchedOrder) {
        setErrorMessage("Order not found.");
      }

      return fetchedOrder;
    } catch (error) {
      console.error("Fetch order error:", error);
      setOrder(null);
      throw error;
    }
  };

  const confirmStripePayment = async (orderId) => {
    try {
      setVerifying(true);

      await api.post("/payment/stripe/confirm", {
        orderId,
      });

      await fetchOrder(orderId);
    } catch (error) {
      console.error("Stripe confirmation error:", error);

      // Even if the confirm endpoint fails, try to load the order.
      // The payment may already have been confirmed by the backend.
      await fetchOrder(orderId);
    } finally {
      setVerifying(false);
    }
  };

  const verifyEsewaPayment = async (data) => {
    try {
      setVerifying(true);

      const response = await api.post("/payment/verify", {
        data,
      });

      const verifiedOrder =
        response?.data?.order || null;

      if (verifiedOrder) {
        setOrder(verifiedOrder);
        return;
      }

      const verifiedOrderId =
        response?.data?.orderId ||
        response?.data?.order_id;

      if (!verifiedOrderId) {
        throw new Error(
          "The payment was verified, but no order ID was returned."
        );
      }

      await fetchOrder(verifiedOrderId);
    } catch (error) {
      console.error("eSewa verification error:", error);
      setOrder(null);
      throw error;
    } finally {
      setVerifying(false);
    }
  };

  const formatStatus = (status) => {
    if (!status || typeof status !== "string") {
      return "Pending";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getPaymentText = () => {
    if (order?.payment_status === "paid") {
      const method =
        order?.payment_method === "stripe"
          ? "Stripe"
          : order?.payment_method === "esewa"
            ? "eSewa"
            : formatStatus(order?.payment_method);

      return `Paid via ${method}`;
    }

    if (
      order?.payment_method === "cod" ||
      order?.payment_method === "cash_on_delivery"
    ) {
      return "Cash on Delivery";
    }

    return "Payment Pending";
  };

  if (loading || verifying) {
    return (
      <div style={messagePageStyle}>
        <h2>
          {verifying
            ? "Verifying payment..."
            : "Loading order..."}
        </h2>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div style={messagePageStyle}>
        <div>
          <h2>Order not found</h2>
          <p>{errorMessage || "Unable to find this order."}</p>

          <Link
            to="/orders"
            style={messageLinkStyle}
          >
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <style>{pageStyle}</style>

      <div className="confirmation-container">
        <div className="success-card">
          <div className="success-icon">✓</div>

          <h1>Order Confirmed!</h1>

          <p className="thank-you">
            Thank you for your purchase. Your artwork is
            being prepared with care.
          </p>

          <div className="order-meta">
            Order #
            {order.order_number ||
              order.order_id ||
              order.id}{" "}
            · {getPaymentText()}
          </div>

          <div className="status-pill">
            📦 Status: {formatStatus(order.status)}
          </div>

          <div className="actions">
            <Link
              to="/orders"
              className="secondary-link"
            >
              View Orders
            </Link>

            <Link
              to="/products"
              className="primary-link"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const messagePageStyle = {
  minHeight: "100vh",
  padding: "80px 22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  background: "#fffaf3",
  color: "#5d5148",
};

const messageLinkStyle = {
  display: "inline-block",
  marginTop: "18px",
  padding: "12px 22px",
  borderRadius: "14px",
  background: "#929b83",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "800",
};

const pageStyle = `
.confirmation-page {
  min-height: 100vh;
  background: #fffaf3;
  padding: 60px 22px 90px;
}

.confirmation-container {
  max-width: 720px;
  margin: 0 auto;
}

.success-card {
  background: #ffffff;
  border-radius: 30px;
  padding: 44px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(61, 54, 48, 0.1);
}

.success-card h1 {
  margin: 0;
  color: #3f4635;
  font-size: 36px;
}

.thank-you {
  max-width: 520px;
  margin: 14px auto 0;
  color: #786d64;
  font-size: 16px;
  line-height: 1.7;
}

.success-icon {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  margin: 0 auto 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(146, 155, 131, 0.16);
  color: #6d755f;
  font-size: 34px;
  font-weight: 900;
}

.order-meta {
  color: #a09387;
  font-size: 13px;
  font-weight: 700;
  margin: 20px 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(146, 155, 131, 0.16);
  color: #5f6b51;
  padding: 9px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  margin: 10px 0 28px;
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-link,
.secondary-link {
  padding: 13px 24px;
  border-radius: 16px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.primary-link:hover,
.secondary-link:hover {
  transform: translateY(-2px);
}

.primary-link {
  background: #929b83;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(109, 117, 95, 0.18);
}

.secondary-link {
  background: #ffffff;
  color: #5d5148;
  border: 1px solid #d8c7b5;
}

@media (max-width: 600px) {
  .confirmation-page {
    padding: 35px 16px 60px;
  }

  .success-card {
    padding: 32px 20px;
    border-radius: 22px;
  }

  .success-card h1 {
    font-size: 29px;
  }

  .actions {
    flex-direction: column;
  }

  .primary-link,
  .secondary-link {
    width: 100%;
    box-sizing: border-box;
  }
}
`;

export default OrderConfirmation;