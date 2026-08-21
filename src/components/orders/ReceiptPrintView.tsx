import React from 'react';
import { Order, Settings } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface ReceiptPrintViewProps {
  order: Order;
  settings: Settings | null;
}

export const ReceiptPrintView: React.FC<ReceiptPrintViewProps> = ({ order, settings }) => {
  return (
    <div
      id="printable-receipt"
      className="hidden print:block font-mono text-[12px] leading-tight text-black bg-white p-2"
    >
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <div className="font-bold text-base">{settings?.name || 'MEU NEGÓCIO'}</div>
        <div className="text-[10px]">{settings?.slogan || 'O melhor sabor'}</div>
        <div className="text-[10px]">{settings?.address}</div>
        <div className="text-[10px]">Tel / Whats: {settings?.phone || settings?.whatsapp}</div>
      </div>

      {/* Order Info */}
      <div className="py-2 border-b border-dashed border-black space-y-0.5">
        <div className="flex justify-between font-bold text-sm">
          <span>PEDIDO #{order.orderNumber}</span>
          <span>{order.type.toUpperCase()}</span>
        </div>
        <div className="text-[10px]">Data: {formatDateTime(order.createdAt)}</div>
        <div className="text-[10px]">Origem: {order.origin}</div>
      </div>

      {/* Customer Info */}
      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-0.5">
        <div><span className="font-bold">Cliente:</span> {order.customerName}</div>
        <div><span className="font-bold">Telefone:</span> {order.customerPhone}</div>
        {order.type === 'Entrega' && order.customerAddress && (
          <div><span className="font-bold">Endereço:</span> {order.customerAddress}</div>
        )}
      </div>

      {/* Items Table */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="font-bold text-[11px] pb-1 border-b border-black flex justify-between">
          <span>ITEM / QTD</span>
          <span>TOTAL</span>
        </div>
        <div className="pt-1 space-y-1.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-[11px]">
              <div className="flex justify-between font-bold">
                <span>{item.quantity}x {item.name}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
              
              {/* Customizations */}
              {(item.size || item.crust || (item.addons && item.addons.length > 0)) && (
                <div className="text-[10px] pl-2 text-gray-700">
                  {item.size && <span>[Tam: {item.size}] </span>}
                  {item.crust && <span>[Borda/Adicional: {item.crust}] </span>}
                  {item.addons && item.addons.length > 0 && (
                    <span>[+ {item.addons.join(', ')}]</span>
                  )}
                </div>
              )}

              {item.notes && (
                <div className="text-[10px] italic pl-2">Obs: {item.notes}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between">
            <span>Taxa de Entrega:</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex justify-between">
            <span>Desconto:</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-black">
          <span>TOTAL:</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Payment & Notes */}
      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-0.5">
        <div>
          <span className="font-bold">Forma de Pagamento:</span> {order.paymentMethod}
        </div>
        <div>
          <span className="font-bold">Status Pagamento:</span> {order.paymentStatus}
        </div>
        {order.changeFor && order.paymentMethod === 'Dinheiro' && (
          <>
            <div><span className="font-bold">Troco para:</span> {formatCurrency(order.changeFor)}</div>
            <div><span className="font-bold">Valor do troco:</span> {formatCurrency(order.changeFor - order.total)}</div>
          </>
        )}
        {order.notes && (
          <div className="pt-1"><span className="font-bold">Obs Geral:</span> {order.notes}</div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-3 text-[10px]">
        <div>{settings?.receiptFooterText || 'Agradecemos a sua preferência!'}</div>
        <div className="pt-2 text-[8px] text-gray-500">{settings?.name || 'Gestão Local'}</div>
      </div>
    </div>
  );
};
