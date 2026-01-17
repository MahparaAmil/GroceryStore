ActiveAdmin.register_page "Dashboard" do
  menu priority: 1, label: "Dashboard"

  content title: "Dashboard" do
    div class: "dashboard-stats", style: "display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;" do
      div class: "stat-card", style: "background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 25px;" do
        h4 "TOTAL ORDERS", style: "color: #8b949e; font-size: 0.75rem; text-transform: uppercase; margin: 0 0 10px 0; font-weight: 600;"
        h2 Order.count, style: "color: #fff; font-size: 2rem; margin: 0; font-weight: 700;"
      end
      div class: "stat-card", style: "background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 25px;" do
        h4 "TOTAL REWARDS/INV", style: "color: #8b949e; font-size: 0.75rem; text-transform: uppercase; margin: 0 0 10px 0; font-weight: 600;"
        h2 "0", style: "color: #fff; font-size: 2rem; margin: 0; font-weight: 700;"
      end
      div class: "stat-card", style: "background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 25px;" do
        h4 "CUSTOMERS", style: "color: #8b949e; font-size: 0.75rem; text-transform: uppercase; margin: 0 0 10px 0; font-weight: 600;"
        h2 User.count, style: "color: #fff; font-size: 2rem; margin: 0; font-weight: 700;"
      end
    end

    columns do
      column span: 2 do
        panel "Recent Orders" do
          table_for Order.includes(:user).order(created_at: :desc).limit(5) do
            column("ID") { |order| link_to "##{order.id}", admin_order_path(order) }
            column("Customer") { |order| order.user&.email }
            column("Status") { |order| status_tag order.status }
            column("Total") { |order| number_to_currency(order.total) }
          end
        end
      end

      column do
        panel "Store Stats" do
          div style: "color: #8b949e;" do
            para "Active Products: #{Product.count}"
            para "Revenue: #{number_to_currency(Order.sum(:total) || 0)}"
          end
        end
      end
    end
  end
end
