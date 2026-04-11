export default function RecentShops({ data = [] }) {
  return (
    <div className="card-box">
      <h4>Latest Shop Registrations</h4>

      {data.map((shop, i) => (
        <div key={i} className="list-row">
          <span>{shop.shop_name}</span>

          <small>
            {new Date(shop.created_at).toLocaleTimeString()}
          </small>
        </div>
      ))}
    </div>
  );
}