import React from 'react';
import toWords from 'num-words';

export default function InvoicePreview({ invoice, activeTenant, client }) {
    if (!invoice || !activeTenant || !client) return null;

    const totalAmount = invoice.total_amount || 0;
    const totalTax = invoice.total_tax || 0;
    const grandTotal = totalAmount + totalTax;

    // Helper to convert number to Indian Rupees words
    const amountToWords = (amount) => {
        try {
            if (!amount) return "Zero Rupees Only";
            const integerPart = Math.floor(amount);
            const decimalPart = Math.round((amount - integerPart) * 100);

            let words = toWords(integerPart).replace(/-/g, ' ');
            // Capitalize first letter of each word
            words = words.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            let result = `INR ${words}`;
            if (decimalPart > 0) {
                result += ` and ${decimalPart} Paise`;
            }
            return `${result} Only`;
        } catch {
            return "";
        }
    };

    const isIntraState = activeTenant.state_code === client.state_code;

    // Group line items by HSN for the Tax Summary Table
    const taxSummary = invoice.line_items.reduce((acc, item) => {
        const key = item.hsn_sac || 'N/A';
        const amount = item.quantity * item.rate;
        const taxAmount = amount * (item.gst_rate / 100);

        const cgstRate = isIntraState ? item.gst_rate / 2 : 0;
        const cgstAmount = isIntraState ? taxAmount / 2 : 0;
        const sgstRate = isIntraState ? item.gst_rate / 2 : 0;
        const sgstAmount = isIntraState ? taxAmount / 2 : 0;
        const igstRate = isIntraState ? 0 : item.gst_rate;
        const igstAmount = isIntraState ? 0 : taxAmount;

        if (!acc[key]) {
            acc[key] = {
                hsn: key,
                taxable_value: 0,
                cgst_rate: cgstRate,
                cgst_amount: 0,
                sgst_rate: sgstRate,
                sgst_amount: 0,
                igst_rate: igstRate,
                igst_amount: 0,
                total_tax: 0
            };
        }

        acc[key].taxable_value += amount;
        acc[key].cgst_amount += cgstAmount;
        acc[key].sgst_amount += sgstAmount;
        acc[key].igst_amount += igstAmount;
        acc[key].total_tax += taxAmount;

        return acc;
    }, {});

    const taxRows = Object.values(taxSummary);

    return (
        <div className="invoice-wrapper bg-white">
            <h2 className="invoice-title">Tax Invoice</h2>
            <div className="invoice-border">

                {/* Top Details */}
                <div className="flex-row border-bottom" style={{ minHeight: '180px' }}>
                    <div className="col-6 border-right flex-col">
                        <div className="company-info border-bottom p-1" style={{ flex: 1 }}>
                            <strong className="fs-13">{activeTenant.company_name}</strong><br />
                            <span>{activeTenant.address}</span><br />
                            GSTIN/UIN: <span>{activeTenant.gstin}</span><br />
                            State Name <span style={{ display: 'inline-block', width: '10px' }}>:</span> <span>{activeTenant.state_name}</span>, Code : <span>{activeTenant.state_code}</span><br />
                            {activeTenant.contact && <span>Contact <span style={{ display: 'inline-block', width: '33px' }}>:</span> {activeTenant.contact}<br /></span>}
                            {activeTenant.email && <span>E-Mail <span style={{ display: 'inline-block', width: '38px' }}>:</span> {activeTenant.email}</span>}
                        </div>
                        <div className="buyer-info p-1" style={{ flex: 1 }}>
                            Buyer (Bill to)<br />
                            <strong className="fs-13">{client.buyer_name}</strong><br />
                            <span style={{ whiteSpace: 'pre-wrap' }}>{client.address}</span><br />
                            GSTIN/UIN <span style={{ display: 'inline-block', width: '17px' }}>:</span> <span>{client.gstin}</span><br />
                            State Name <span style={{ display: 'inline-block', width: '10px' }}>:</span> <span>{client.state_name}</span>, Code : <span>{client.state_code}</span>
                        </div>
                    </div>

                    <div className="col-6 flex-col">
                        <div className="flex-row border-bottom">
                            <div className="col-6 border-right p-1 pb-1">
                                Invoice No.<br />
                                <strong className="fs-12">{invoice.invoice_no}</strong>
                            </div>
                            <div className="col-6 p-1 pb-1">
                                Dated<br />
                                <strong className="fs-12">{new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</strong>
                            </div>
                        </div>
                        <div className="flex-row border-bottom" style={{ minHeight: '60px' }}>
                            <div className="col-6 border-right p-1 pb-1">
                                Reference No. & Date.<br />
                                <strong className="fs-12">{invoice.reference}</strong>
                            </div>
                            <div className="col-6 p-1 pb-1">
                                Other References<br />
                                <strong className="fs-12">{invoice.other_reference}</strong>
                            </div>
                        </div>
                        <div className="flex-1"></div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="items-table-wrapper border-bottom">
                    <table className="full-width-table items-table">
                        <thead>
                            <tr>
                                <th className="border-right border-bottom" style={{ width: '5%' }}>SI<br />No.</th>
                                <th className="border-right border-bottom" style={{ width: '36%' }}>Particulars</th>
                                <th className="border-right border-bottom" style={{ width: '10%' }}>HSN/SAC</th>
                                <th className="border-right border-bottom" style={{ width: '8%' }}>GST<br />Rate</th>
                                <th className="border-right border-bottom" style={{ width: '10%' }}>Quantity</th>
                                <th className="border-right border-bottom" style={{ width: '10%' }}>Rate</th>
                                <th className="border-right border-bottom" style={{ width: '5%' }}>per</th>
                                <th className="border-bottom" style={{ width: '16%' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.line_items.map((item, idx) => {
                                const amount = item.quantity * item.rate;
                                return (
                                    <tr key={idx}>
                                        <td className="text-center">{idx + 1}</td>
                                        <td><strong>{item.particulars}</strong></td>
                                        <td className="text-center">{item.hsn_sac}</td>
                                        <td className="text-center">{item.gst_rate} %</td>
                                        <td className="text-right pr-2"><strong>{item.quantity ? item.quantity : ''}</strong></td>
                                        <td className="text-right pr-2">{item.rate ? item.rate.toFixed(2) : ''}</td>
                                        <td className="text-center">{item.per}</td>
                                        <td className="text-right pr-2"><strong>{amount.toFixed(2)}</strong></td>
                                    </tr>
                                );
                            })}
                            {/* Insert Tax summary rows inside items table to match exact design */}
                            {taxRows.map((row, idx) => (
                                <React.Fragment key={`tax-${idx}`}>
                                    {isIntraState ? (
                                        <>
                                            <tr>
                                                <td></td>
                                                <td className="text-right pr-2"><strong>CGST</strong></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td className="text-right pr-2"><strong>{row.cgst_amount.toFixed(2)}</strong></td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td className="text-right pr-2"><strong>SGST</strong></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td className="text-right pr-2"><strong>{row.sgst_amount.toFixed(2)}</strong></td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td></td>
                                            <td className="text-right pr-2"><strong>IGST</strong></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td className="text-right pr-2"><strong>{row.igst_amount.toFixed(2)}</strong></td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {/* Fill empty space if few items */}
                            {Array.from({ length: Math.max(0, 5 - invoice.line_items.length - (taxRows.length * (isIntraState ? 2 : 1))) }).map((_, i) => (
                                <tr key={`empty-${i}`}>
                                    <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="7" className="border-top text-right p-1 pr-2 border-right">Total</td>
                                <td className="border-top text-right p-1 pr-2"><strong className="fs-14">₹ {grandTotal.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Amount Words */}
                <div className="flex-row border-bottom pl-1 pr-1 pt-0_5 pb-0_5">
                    <div className="col-8">
                        Amount Chargeable (in words)<br />
                        <strong className="fs-13">{amountToWords(grandTotal)}</strong>
                    </div>
                    <div className="col-4 text-right align-self-end text-sm text-italic">
                        <em>E. & O.E</em>
                    </div>
                </div>

                {/* Tax Table */}
                <div className="tax-table-wrapper border-bottom">
                    <table className="full-width-table tax-table">
                        <thead>
                            <tr>
                                <th rowSpan="2" className="border-right border-bottom">HSN/SAC</th>
                                <th rowSpan="2" className="border-right border-bottom">Taxable<br />Value</th>
                                {isIntraState ? (
                                    <>
                                        <th colSpan="2" className="border-right border-bottom">Central Tax</th>
                                        <th colSpan="2" className="border-right border-bottom">State Tax</th>
                                    </>
                                ) : (
                                    <th colSpan="2" className="border-right border-bottom">Integrated Tax</th>
                                )}
                                <th rowSpan="2" className="border-bottom">Total<br />Tax Amount</th>
                            </tr>
                            <tr>
                                {isIntraState ? (
                                    <>
                                        <th className="border-right border-bottom">Rate</th>
                                        <th className="border-right border-bottom">Amount</th>
                                        <th className="border-right border-bottom">Rate</th>
                                        <th className="border-right border-bottom">Amount</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="border-right border-bottom">Rate</th>
                                        <th className="border-right border-bottom">Amount</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {taxRows.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="border-right text-center">{row.hsn}</td>
                                    <td className="border-right text-right pr-1">{row.taxable_value.toFixed(2)}</td>
                                    {isIntraState ? (
                                        <>
                                            <td className="border-right text-center">{row.cgst_rate}%</td>
                                            <td className="border-right text-right pr-1">{row.cgst_amount.toFixed(2)}</td>
                                            <td className="border-right text-center">{row.sgst_rate}%</td>
                                            <td className="border-right text-right pr-1">{row.sgst_amount.toFixed(2)}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="border-right text-center">{row.igst_rate}%</td>
                                            <td className="border-right text-right pr-1">{row.igst_amount.toFixed(2)}</td>
                                        </>
                                    )}
                                    <td className="text-right pr-1">{row.total_tax.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="border-top border-right text-right p-0_5 pr-1"><strong>Total</strong></td>
                                <td className="border-top border-right text-right p-0_5 pr-1"><strong>{totalAmount.toFixed(2)}</strong></td>
                                {isIntraState ? (
                                    <>
                                        <td className="border-top border-right"></td>
                                        <td className="border-top border-right text-right p-0_5 pr-1"><strong>{(totalTax / 2).toFixed(2)}</strong></td>
                                        <td className="border-top border-right"></td>
                                        <td className="border-top border-right text-right p-0_5 pr-1"><strong>{(totalTax / 2).toFixed(2)}</strong></td>
                                    </>
                                ) : (
                                    <>
                                        <td className="border-top border-right"></td>
                                        <td className="border-top border-right text-right p-0_5 pr-1"><strong>{totalTax.toFixed(2)}</strong></td>
                                    </>
                                )}
                                <td className="border-top text-right p-0_5 pr-1"><strong>{totalTax.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Bank & Signatures */}
                <div className="flex-row border-bottom" style={{ minHeight: '80px' }}>
                    <div className="col-6 p-1 flex-col justify-space-between">
                        <div>
                            Tax Amount (in words) : <strong>{amountToWords(totalTax)}</strong>
                        </div>
                        {invoice.remarks && (
                            <div className="mt-2 text-sm">
                                <em>Remarks:</em><br />
                                <span>{invoice.remarks}</span>
                            </div>
                        )}
                    </div>
                    <div className="col-6 p-1 border-left pt-2 pb-1">
                        Company's Bank Details<br />
                        <div className="flex-row">
                            <div className="bank-label">Bank Name</div> : <strong className="pl-1">{activeTenant.bank_name}</strong>
                        </div>
                        <div className="flex-row">
                            <div className="bank-label">A/c No.</div> : <strong className="pl-1">{activeTenant.bank_acc}</strong>
                        </div>
                        <div className="flex-row">
                            <div className="bank-label">Branch & IFS Code</div> : <strong className="pl-1">{activeTenant.bank_ifsc}</strong>
                        </div>
                    </div>
                </div>

                <div className="flex-row" style={{ minHeight: '100px' }}>
                    <div className="col-6 p-1 border-right flex-col justify-end text-sm">
                        Customer's Seal and Signature
                    </div>
                    <div className="col-6 p-1 flex-col justify-space-between text-right text-sm">
                        <strong>for {activeTenant.company_name}</strong>
                        <div style={{ marginTop: '40px' }}>
                            Authorised Signatory
                        </div>
                    </div>
                </div>

            </div>
            <div className="text-center mt-1 text-sm pb-2">
                This is a Computer Generated Invoice
            </div>
        </div>
    );
}
