import React from 'react';

const PrintInvoice = ({ order }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
      refunded: 'Đã hoàn tiền',
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cod: 'Thanh toán khi nhận hàng',
      momo: 'MoMo',
      vnpay: 'VNPay',
    };
    return labels[method] || method;
  };

  const formatOrderNumber = (order) => {
    if (order.orderNumber) return order.orderNumber;
    const date = new Date(order.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const shortId = order._id.slice(-6).toUpperCase();
    return `ORD-${year}${month}-${shortId}`;
  };

  return (
    <div className="invoice-container">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container,
          .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }

        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          font-family: Arial, sans-serif;
          background: white;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }

        .company-info h1 {
          margin: 0;
          font-size: 24px;
          color: #000;
        }

        .company-info p {
          margin: 5px 0;
          color: #666;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h2 {
          margin: 0;
          font-size: 28px;
          color: #000;
        }

        .invoice-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .detail-section h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          color: #666;
        }

        .detail-section p {
          margin: 5px 0;
          font-size: 14px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        .items-table th {
          background: #f5f5f5;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          border-bottom: 2px solid #000;
        }

        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          font-size: 14px;
        }

        .items-table .text-right {
          text-align: right;
        }

        .totals-section {
          margin-left: auto;
          width: 300px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 14px;
        }

        .total-row.grand-total {
          background: #f5f5f5;
          font-weight: bold;
          font-size: 16px;
          margin-top: 10px;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }

        .footer-notes {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }

        .print-button-container {
          text-align: center;
          margin-bottom: 20px;
        }

        .print-button {
          background: #000;
          color: white;
          padding: 10px 30px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .print-button:hover {
          background: #333;
        }
      `}</style>

      <div className="print-button-container no-print">
        <button className="print-button" onClick={() => window.print()}>
          In hóa đơn
        </button>
      </div>

      <div className="invoice-header">
        <div className="company-info">
          <h1>Mom Baby Milk</h1>
          <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
          <p>Điện thoại: (028) 1234 5678</p>
          <p>Email: info@mombabymilk.vn</p>
        </div>
        <div className="invoice-title">
          <h2>HÓA ĐƠN</h2>
          <p>Số: {formatOrderNumber(order)}</p>
          <p>Ngày: {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="invoice-details">
        <div className="detail-section">
          <h3>Thông tin khách hàng</h3>
          <p><strong>{order.customer?.fullname || 'N/A'}</strong></p>
          <p>Điện thoại: {order.phone || order.customer?.phone || 'N/A'}</p>
          {order.customer?.email && (
            <p>Email: {order.customer.email}</p>
          )}
        </div>
        <div className="detail-section">
          <h3>Địa chỉ giao hàng</h3>
          <p>{order.shippingAddress || 'N/A'}</p>
        </div>
      </div>

      <div className="invoice-details">
        <div className="detail-section">
          <h3>Phương thức thanh toán</h3>
          <p>{getPaymentMethodLabel(order.paymentMethod)}</p>
        </div>
        <div className="detail-section">
          <h3>Trạng thái thanh toán</h3>
          <p>{getPaymentStatusLabel(order.paymentStatus)}</p>
        </div>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Sản phẩm</th>
            <th className="text-right">Số lượng</th>
            <th className="text-right">Đơn giá</th>
            <th className="text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.cartItems?.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                {item.name}
                {item.isPreOrder && ' (Đặt trước)'}
              </td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{formatPrice(item.price)}</td>
              <td className="text-right">
                {formatPrice(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals-section">
        <div className="total-row">
          <span>Tạm tính:</span>
          <span>{formatPrice(
            order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
          )}</span>
        </div>
        {order.rewardPointsUsed > 0 && (
          <div className="total-row">
            <span>Điểm thưởng:</span>
            <span>-{formatPrice(order.rewardPointsUsed)}</span>
          </div>
        )}
        {order.voucherUsed && (
          <div className="total-row">
            <span>Voucher ({order.voucherUsed.code}):</span>
            <span>-{order.voucherUsed.discountPercentage}%</span>
          </div>
        )}
        <div className="total-row grand-total">
          <span>TỔNG CỘNG:</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="footer-notes">
        <p><strong>Ghi chú:</strong></p>
        <p>
          Cảm ơn quý khách đã tin tưởng và mua sắm tại Mom Baby Milk.
          Mọi thắc mắc xin vui lòng liên hệ hotline hoặc email để được hỗ trợ.
        </p>
        {order.note && (
          <>
            <p style={{ marginTop: '15px' }}><strong>Ghi chú đơn hàng:</strong></p>
            <p>{order.note}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PrintInvoice;
