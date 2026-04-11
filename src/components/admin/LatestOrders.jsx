import { ShoppingCart } from "lucide-react";
export default function LatestOrders({ data = [] }) {
  return (
    <div className="card-box">
      <div className="card-header">
  <ShoppingCart size={18} className="card-icon" />
  <h4>Latest Orders</h4>
</div>

      {data.map((order, i) => (
        <div key={i} className="list-row">
          <span>
            {order.order_code} - ₹{order.total_amount || 0}
          </span>

          <small className={`status ${order.status.toLowerCase()}`}>
            {order.status}
          </small>
        </div>
      ))}
    </div>
  );
}