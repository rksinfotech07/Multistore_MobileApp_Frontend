import { Store } from "lucide-react";
export default function RecentShops({ data = [] }) {
  return (
    <div className="card-box">
      <div className="card-header">
  <Store size={18} className="card-icon" />
  <h4>Latest Shop Registrations</h4>
</div>

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