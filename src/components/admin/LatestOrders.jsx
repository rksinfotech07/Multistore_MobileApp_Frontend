export default function LatestOrders({ data = [] }) {
  return (
    <div className="card-box">
      <h4>Latest Orders</h4>

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