import React from 'react';

const PrintPackingSlip = ({ order }) => {
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getItemStatusLabel = (status) => {
    const labels = {
      available: 'Sẵn có',
      preorder_pending: 'Đang chờ về',
      preorder_ready: 'Đã về, sẵn sàng',
      shipped: 'Đã gửi',
    };
    return labels[status] || status;
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
    <div className="packing-slip-container">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .packing-slip-container,
          .packing-slip-container * {
            visibility: visible;
          }
          .packing-slip-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }

        .packing-slip-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          font-family: Arial, sans-serif;
          background: white;
        }

        .slip-header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
        }

        .slip-header h1 {
          margin: 0 0 10px 0;
          font-size: 32px;
          font-weight: bold;
        }

        .slip-header p {
          margin: 5px 0;
          font-size: 14px;
        }

        .slip-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        .detail-box {
          border: 2px solid #000;
          padding: 20px;
        }

        .detail-box h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 10px;
        }

        .detail-box p {
          margin: 8px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .items-section {
          margin-bottom: 40px;
        }

        .items-section h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table th {
          background: #000;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
        }

        .items-table td {
          padding: 12px;
          border: 1px solid #ddd;
          font-size: 14px;
        }

        .items-table .text-center {
          text-align: center;
        }

        .items-table .checkbox-col {
          width: 50px;
          text-align: center;
        }

        .checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #000;
          display: inline-block;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-available {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-preorder {
          background: #fff3e0;
          color: #e65100;
        }

        .footer-section {
          margin-top: 60px;
          page-break-inside: avoid;
        }

        .signature-boxes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 40px;
        }

        .signature-box {
          border-top: 2px dashed #999;
          padding-top: 20px;
        }

        .signature-box .title {
          font-weight: bold;
          text-align: center;
          margin-bottom: 60px;
        }

        .signature-box .signature-line {
          border-top: 1px solid #000;
          text-align: center;
          padding-top: 10px;
          margin-top: 60px;
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

        .notes-section {
          border: 2px dashed #999;
          padding: 15px;
          margin-top: 20px;
          min-height: 80px;
        }

        .notes-section h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: bold;
        }
      `}</style>

      <div className="print-button-container no-print">
        <button className="print-button" onClick={() => window.print()}>
          In phiếu đóng gói
        </button>
      </div>

      <div className="slip-header">
        <h1>PHIẾU ĐÓNG GÓI</h1>
        <p>Mom Baby Milk - Chuyên cung cấp sữa cho mẹ và bé</p>
        <p style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
          Đơn hàng: {formatOrderNumber(order)}
        </p>
        <p>Ngày tạo: {formatDate(order.createdAt)}</p>
      </div>

      <div className="slip-details">
        <div className="detail-box">
          <h3>Người nhận</h3>
          <p><strong style={{ fontSize: '16px' }}>{order.customer?.fullname || 'N/A'}</strong></p>
          <p><strong>SĐT:</strong> {order.phone || order.customer?.phone || 'N/A'}</p>
          {order.customer?.email && (
            <p><strong>Email:</strong> {order.customer.email}</p>
          )}
        </div>
        <div className="detail-box">
          <h3>Địa chỉ giao hàng</h3>
          <p>{order.shippingAddress || 'N/A'}</p>
        </div>
      </div>

      <div className="items-section">
        <h3>Danh sách sản phẩm cần đóng gói</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th className="checkbox-col">✓</th>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th className="text-center">Số lượng</th>
              <th className="text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {order.cartItems?.map((item, index) => (
              <tr key={index}>
                <td className="checkbox-col">
                  <span className="checkbox"></span>
                </td>
                <td>{index + 1}</td>
                <td>
                  <strong>{item.name}</strong>
                  {item.isPreOrder && (
                    <span
                      style={{
                        marginLeft: '8px',
                        color: '#e65100',
                        fontSize: '12px',
                      }}
                    >
                      (ĐẶT TRƯỚC)
                    </span>
                  )}
                </td>
                <td className="text-center">
                  <strong style={{ fontSize: '16px' }}>{item.quantity}</strong>
                </td>
                <td className="text-center">
                  <span
                    className={`status-badge ${
                      item.isPreOrder ? 'status-preorder' : 'status-available'
                    }`}
                  >
                    {item.itemStatus
                      ? getItemStatusLabel(item.itemStatus)
                      : 'Sẵn có'}
                  </span>
                </td>
              </tr>
            ))}
            <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
              <td colSpan="3" style={{ textAlign: 'right', padding: '12px' }}>
                TỔNG SỐ LƯỢNG:
              </td>
              <td className="text-center" style={{ fontSize: '18px' }}>
                {order.cartItems?.reduce((sum, item) => sum + item.quantity, 0)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {order.note && (
        <div className="notes-section">
          <h4>GHI CHÚ ĐƠN HÀNG:</h4>
          <p>{order.note}</p>
        </div>
      )}

      {!order.note && (
        <div className="notes-section">
          <h4>GHI CHÚ ĐÓNG GÓI:</h4>
          <p style={{ color: '#999', fontStyle: 'italic' }}>
            (Không có ghi chú)
          </p>
        </div>
      )}

      <div className="footer-section">
        <div className="signature-boxes">
          <div className="signature-box">
            <div className="title">NGƯỜI ĐÓNG GÓI</div>
            <div className="signature-line">
              (Ký và ghi rõ họ tên)
            </div>
          </div>
          <div className="signature-box">
            <div className="title">NGƯỜI NHẬN HÀNG</div>
            <div className="signature-line">
              (Ký và ghi rõ họ tên)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPackingSlip;
