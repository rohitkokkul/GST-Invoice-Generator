document.addEventListener("DOMContentLoaded", () => {
    let itemIndex = 0;

    const itemsContainer = document.getElementById("items-container");
    const btnAddItem = document.getElementById("btn-add-item");
    const btnPreview = document.getElementById("btn-preview");
    const btnReset = document.getElementById("btn-reset");
    const btnEdit = document.getElementById("btn-edit");
    const btnDownload = document.getElementById("btn-download");

    const btnSave = document.getElementById("btn-save");

    const formSection = document.getElementById("form-section");
    const previewSection = document.getElementById("preview-section");
    const invoiceForm = document.getElementById("invoice-form");

    // Profile Management Elements
    const profileSelect = document.getElementById("profile-select");
    const profileNameInput = document.getElementById("profile-name");
    const btnSaveProfile = document.getElementById("btn-save-profile");
    const btnLoadProfile = document.getElementById("btn-load-profile");
    const btnDeleteProfile = document.getElementById("btn-delete-profile");

    const PROFILES_STORAGE_KEY = "gstInvoiceProfiles";

    function getSavedProfiles() {
        const data = localStorage.getItem(PROFILES_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    function saveProfiles(profiles) {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    }

    function refreshProfileSelect() {
        const profiles = getSavedProfiles();
        profileSelect.innerHTML = '<option value="">-- Select a saved profile --</option>';
        for (const name in profiles) {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            profileSelect.appendChild(option);
        }
    }

    function getFormData() {
        return {
            cName: document.getElementById("c-name").value,
            cAddress: document.getElementById("c-address").value,
            cGstin: document.getElementById("c-gstin").value,
            cState: document.getElementById("c-state").value,
            cStateCode: document.getElementById("c-state-code").value,
            cContact: document.getElementById("c-contact").value,
            cEmail: document.getElementById("c-email").value,

            bName: document.getElementById("b-name").value,
            bAddress: document.getElementById("b-address").value,
            bGstin: document.getElementById("b-gstin").value,
            bState: document.getElementById("b-state").value,
            bStateCode: document.getElementById("b-state-code").value,

            bankName: document.getElementById("bank-name").value,
            bankAcc: document.getElementById("bank-acc").value,
            bankIfsc: document.getElementById("bank-ifsc").value,
        };
    }

    function setFormData(formData) {
        document.getElementById("c-name").value = formData.cName || "";
        document.getElementById("c-address").value = formData.cAddress || "";
        document.getElementById("c-gstin").value = formData.cGstin || "";
        document.getElementById("c-state").value = formData.cState || "";
        document.getElementById("c-state-code").value = formData.cStateCode || "";
        document.getElementById("c-contact").value = formData.cContact || "";
        document.getElementById("c-email").value = formData.cEmail || "";

        document.getElementById("b-name").value = formData.bName || "";
        document.getElementById("b-address").value = formData.bAddress || "";
        document.getElementById("b-gstin").value = formData.bGstin || "";
        document.getElementById("b-state").value = formData.bState || "";
        document.getElementById("b-state-code").value = formData.bStateCode || "";

        document.getElementById("bank-name").value = formData.bankName || "";
        document.getElementById("bank-acc").value = formData.bankAcc || "";
        document.getElementById("bank-ifsc").value = formData.bankIfsc || "";
    }

    // Default Save button updates "Default" profile or quick save
    btnSave.addEventListener("click", () => {
        let profiles = getSavedProfiles();
        profiles["Quick Save"] = getFormData();
        saveProfiles(profiles);
        refreshProfileSelect();
        alert("Details saved to 'Quick Save' profile successfully!");
    });

    btnSaveProfile.addEventListener("click", () => {
        const name = profileNameInput.value.trim();
        if (!name) {
            alert("Please enter a profile name to save.");
            return;
        }
        let profiles = getSavedProfiles();
        profiles[name] = getFormData();
        saveProfiles(profiles);
        refreshProfileSelect();
        profileSelect.value = name;
        profileNameInput.value = "";
        alert(`Profile '${name}' saved successfully!`);
    });

    btnLoadProfile.addEventListener("click", () => {
        const name = profileSelect.value;
        if (!name) {
            alert("Please select a profile to load.");
            return;
        }
        const profiles = getSavedProfiles();
        if (profiles[name]) {
            setFormData(profiles[name]);
            // alert(`Profile '${name}' loaded successfully!`);
        }
    });

    btnDeleteProfile.addEventListener("click", () => {
        const name = profileSelect.value;
        if (!name) {
            alert("Please select a profile to delete.");
            return;
        }
        if (confirm(`Are you sure you want to delete the profile '${name}'?`)) {
            let profiles = getSavedProfiles();
            delete profiles[name];
            saveProfiles(profiles);
            refreshProfileSelect();
        }
    });

    // Initialize list
    refreshProfileSelect();

    function addItemRow() {
        itemIndex++;
        const row = document.createElement("div");
        row.className = "item-row";
        row.id = `item-row-${itemIndex}`;

        const quillId = `quill-editor-${itemIndex}`;

        row.innerHTML = `
            <div class="quill-wrapper" style="flex: 1 1 100%; min-width: 250px; background: #fff; border-radius: 4px; border: 1px solid #ccc; overflow: hidden; margin-bottom: 5px;">
                <div id="${quillId}" style="min-height: 80px; font-size: 14px;"></div>
            </div>
            <input type="hidden" class="i-particulars" required>
            <input type="text" class="i-hsn" placeholder="HSN/SAC">
            <input type="number" class="i-gst" placeholder="GST Rate (%)" min="0" max="100" step="0.1" required>
            <input type="number" class="i-qty" placeholder="Quantity" min="1" step="0.01" required>
            <input type="number" class="i-rate" placeholder="Rate" min="0" step="0.01" required>
            <input type="text" class="i-per" placeholder="Per" style="flex: 1 1 60px;">
            <input type="number" class="i-amount" placeholder="Amount" readonly>
            <button type="button" class="btn btn-remove" onclick="removeItem(${itemIndex})">X</button>
        `;

        itemsContainer.appendChild(row);

        // Initialize Quill Editor
        const quill = new Quill(`#${quillId}`, {
            theme: 'snow',
            placeholder: 'Particulars (multiline, bullet points...)',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }]
                ]
            }
        });

        const hiddenInput = row.querySelector('.i-particulars');

        quill.on('text-change', () => {
            // Require content
            if (quill.getText().trim() === '') {
                hiddenInput.value = '';
            } else {
                hiddenInput.value = quill.root.innerHTML;
            }
        });

        hiddenInput.setParticulars = (html) => {
            quill.root.innerHTML = html;
            hiddenInput.value = html;
        };

        const qty = row.querySelector('.i-qty');
        const rate = row.querySelector('.i-rate');
        const gst = row.querySelector('.i-gst');

        [qty, rate, gst].forEach(el => {
            el.addEventListener('input', () => {
                if (parseFloat(gst.value) > 100) gst.value = 100;
                if (parseFloat(gst.value) < 0) gst.value = 0;
                if (parseFloat(qty.value) < 0) qty.value = 0;
                if (parseFloat(rate.value) < 0) rate.value = 0;
                calculateRowAmount(row);
            });
        });

        // Set Default for first row
        if (itemIndex === 1) {
            hiddenInput.setParticulars("<p><strong>RENTAL DESKTOP SET</strong></p>");
            row.querySelector('.i-hsn').value = "997315";
            row.querySelector('.i-gst').value = "18";
            row.querySelector('.i-qty').value = "1";
            row.querySelector('.i-rate').value = "2800";
            calculateRowAmount(row);
        }
    }

    window.removeItem = function (id) {
        const row = document.getElementById(`item-row-${id}`);
        if (row && itemsContainer.children.length > 1) {
            row.remove();
        } else if (itemsContainer.children.length === 1) {
            alert("Minimum 1 line item is required.");
        }
    };

    function calculateRowAmount(row) {
        const qty = parseFloat(row.querySelector('.i-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.i-rate').value) || 0;
        const amount = qty * rate;
        row.querySelector('.i-amount').value = amount.toFixed(2);
    }

    addItemRow();

    btnAddItem.addEventListener("click", addItemRow);

    btnReset.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset the form?")) {
            invoiceForm.reset();
            itemsContainer.innerHTML = "";
            addItemRow();
        }
    });

    btnPreview.addEventListener("click", () => {
        if (!invoiceForm.checkValidity()) {
            invoiceForm.reportValidity();
            return;
        }
        generatePreview();
        formSection.classList.add("hidden");
        previewSection.classList.remove("hidden");
    });

    btnEdit.addEventListener("click", () => {
        formSection.classList.remove("hidden");
        previewSection.classList.add("hidden");
    });

    function setDefaultText(id, value, isInput = true) {
        const el = document.getElementById(id);
        if (el) el.textContent = value || (isInput ? "" : "");
    }

    function formatDate(rawDate) {
        if (!rawDate) return "";
        const dateObj = new Date(rawDate);
        if (isNaN(dateObj)) return rawDate;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    }

    function generatePreview() {
        setDefaultText("prev-c-name", document.getElementById("c-name").value);
        setDefaultText("prev-c-address", document.getElementById("c-address").value);
        setDefaultText("prev-c-gstin", document.getElementById("c-gstin").value);
        setDefaultText("prev-c-state", document.getElementById("c-state").value);
        setDefaultText("prev-c-state-code", document.getElementById("c-state-code").value);

        const cContact = document.getElementById("c-contact").value;
        const cEmail = document.getElementById("c-email").value;

        const contWrap = document.getElementById("contact-wrapper");
        const emailWrap = document.getElementById("email-wrapper");
        if (cContact) {
            contWrap.style.display = "inline";
            setDefaultText("prev-c-contact", cContact);
        } else { contWrap.style.display = "none"; }

        if (cEmail) {
            emailWrap.style.display = "inline";
            setDefaultText("prev-c-email", cEmail);
        } else { emailWrap.style.display = "none"; }

        setDefaultText("prev-sign-company", document.getElementById("c-name").value);

        setDefaultText("prev-b-name", document.getElementById("b-name").value);
        setDefaultText("prev-b-address", document.getElementById("b-address").value);
        setDefaultText("prev-b-gstin", document.getElementById("b-gstin").value);
        setDefaultText("prev-b-state", document.getElementById("b-state").value);
        setDefaultText("prev-b-state-code", document.getElementById("b-state-code").value);

        const formattedDate = formatDate(document.getElementById("inv-date").value);

        setDefaultText("prev-inv-no", document.getElementById("inv-no").value);
        setDefaultText("prev-inv-date", formattedDate);
        setDefaultText("prev-inv-ref", document.getElementById("inv-ref").value);
        setDefaultText("prev-inv-other-ref", document.getElementById("inv-other-ref").value);

        const remarks = document.getElementById("inv-remarks").value;
        const remarksContainer = document.getElementById("remarks-container");
        if (remarks) {
            setDefaultText("prev-inv-remarks", remarks);
            remarksContainer.style.display = "block";
        } else {
            remarksContainer.style.display = "none";
        }

        setDefaultText("prev-bank-name", document.getElementById("bank-name").value);
        setDefaultText("prev-bank-acc", document.getElementById("bank-acc").value);
        setDefaultText("prev-bank-ifsc", document.getElementById("bank-ifsc").value);

        const prevItemsBody = document.getElementById("prev-items-body");
        const prevTaxBody = document.getElementById("prev-tax-body");
        prevItemsBody.innerHTML = "";
        prevTaxBody.innerHTML = "";

        const itemRows = document.querySelectorAll(".item-row");

        let totalAmount = 0;
        let taxMap = {};

        let totalCgst = 0;
        let totalSgst = 0;

        itemRows.forEach((row, index) => {
            const particulars = row.querySelector('.i-particulars').value;
            const hsn = row.querySelector('.i-hsn').value || "";
            const gst = parseFloat(row.querySelector('.i-gst').value) || 0;
            const qty = row.querySelector('.i-qty').value || "";
            const rate = parseFloat(row.querySelector('.i-rate').value) || 0;
            const per = row.querySelector('.i-per').value || "";

            const qVal = parseFloat(qty) || 0;
            const amount = qVal * rate;

            totalAmount += amount;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${index + 1}</td>
                <td class="pt-1 pb-1 particulars-preview" style="vertical-align: top;">${particulars}</td>
                <td class="text-left pt-1 pb-1 pl-1" style="vertical-align: top;">${hsn}</td>
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${gst ? gst + ' %' : ''}</td>
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${qty}</td>
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${rate ? rate.toFixed(2) : ''}</td>
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${per}</td>
                <td class="text-right pt-1 pb-1 pr-1" style="vertical-align: top;"><strong>${amount.toFixed(2)}</strong></td>
            `;
            prevItemsBody.appendChild(tr);

            const key = `${hsn}-${gst}`;
            if (!taxMap[key]) {
                taxMap[key] = { hsn, gstRate: gst, taxable: 0, cgstAmount: 0, sgstAmount: 0 };
            }
            const cgstAmount = amount * (gst / 2 / 100);
            const sgstAmount = amount * (gst / 2 / 100);

            taxMap[key].taxable += amount;
            taxMap[key].cgstAmount += cgstAmount;
            taxMap[key].sgstAmount += sgstAmount;

            totalCgst += cgstAmount;
            totalSgst += sgstAmount;
        });

        // Add CGST and SGST rows in item table if > 0
        if (totalCgst > 0) {
            const trCGST = document.createElement("tr");
            trCGST.innerHTML = `
                <td></td>
                <td class="text-right pr-2"><strong>CGST</strong></td>
                <td></td><td></td><td></td><td></td><td></td>
                <td class="text-right pr-1"><strong>${totalCgst.toFixed(2)}</strong></td>
            `;
            prevItemsBody.appendChild(trCGST);
        }

        if (totalSgst > 0) {
            const trSGST = document.createElement("tr");
            trSGST.innerHTML = `
                <td></td>
                <td class="text-right pr-2"><strong>SGST</strong></td>
                <td></td><td></td><td></td><td></td><td></td>
                <td class="text-right pr-1"><strong>${totalSgst.toFixed(2)}</strong></td>
            `;
            prevItemsBody.appendChild(trSGST);
        }

        // Add an invisible filler row so the table has height and borders stretch
        const fillerTR = document.createElement("tr");
        fillerTR.style.height = "500px"; // Large filler; overflow:hidden in CSS crops it at single-page mark
        fillerTR.innerHTML = `
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        `;
        prevItemsBody.appendChild(fillerTR);


        let totalTaxable = 0;
        let grandTotalTax = 0;

        for (const key in taxMap) {
            const t = taxMap[key];
            const taxRowTotal = t.cgstAmount + t.sgstAmount;

            totalTaxable += t.taxable;
            grandTotalTax += taxRowTotal;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="text-left pl-1 border-right pt-0_5 pb-0_5">${t.hsn}</td>
                <td class="text-right pr-1 border-right pt-0_5 pb-0_5">${t.taxable.toFixed(2)}</td>
                <td class="text-center border-right pt-0_5 pb-0_5">${(t.gstRate / 2).toFixed(2)}%</td>
                <td class="text-right pr-1 border-right pt-0_5 pb-0_5">${t.cgstAmount.toFixed(2)}</td>
                <td class="text-center border-right pt-0_5 pb-0_5">${(t.gstRate / 2).toFixed(2)}%</td>
                <td class="text-right pr-1 border-right pt-0_5 pb-0_5">${t.sgstAmount.toFixed(2)}</td>
                <td class="text-right pr-1 pt-0_5 pb-0_5">${taxRowTotal.toFixed(2)}</td>
            `;
            prevTaxBody.appendChild(tr);
        }

        const grandTotal = totalAmount + totalCgst + totalSgst;

        document.getElementById("prev-total-amount").textContent = grandTotal.toFixed(2).toLocaleString('en-IN');

        document.getElementById("prev-taxable-total").textContent = totalTaxable.toFixed(2);
        document.getElementById("prev-cgst-total").textContent = totalCgst.toFixed(2);
        document.getElementById("prev-sgst-total").textContent = totalSgst.toFixed(2);
        document.getElementById("prev-tax-total").textContent = grandTotalTax.toFixed(2);

        document.getElementById("prev-amount-words").textContent = convertNumberToWords(grandTotal) + " Only";
        document.getElementById("prev-tax-words").textContent = convertNumberToWords(grandTotalTax) + " Only";
    }

    btnDownload.addEventListener("click", () => {
        const invoiceNo = document.getElementById("inv-no").value || "Draft";
        const element = document.getElementById("invoice-preview");

        // Hide edit/download buttons inside pdf
        const opt = {
            margin: 0,
            filename: `Invoice_${invoiceNo.replace(/[^z0-9]/gi, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    });

    function convertNumberToWords(amount) {
        if (amount === 0) return "Zero";

        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function toWords(num) {
            if ((num = num.toString()).length > 9) return 'overflow';
            let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return '';
            let str = '';
            str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
            str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
            str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
            str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
            str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
            return str;
        }

        amount = Math.round(amount * 100) / 100;
        let parts = amount.toString().split(".");
        let rupees = parseInt(parts[0], 10);
        let paise = parseInt(parts[1] || "0", 10);

        let res = "INR " + toWords(rupees);
        if (paise > 0) {
            res += " and " + toWords(paise) + "Paise";
        }
        return res.trim();
    }

    // ===== BATCH IMPORT FEATURE =====

    const batchFileInput = document.getElementById("batch-file-input");
    const batchInvoiceTbody = document.getElementById("batch-invoice-tbody");
    const batchListWrapper = document.getElementById("batch-list-wrapper");
    const batchEmptyState = document.getElementById("batch-empty-state");
    const batchListSummary = document.getElementById("batch-list-summary");
    const batchModalOverlay = document.getElementById("batch-modal-overlay");
    const batchModalClose = document.getElementById("batch-modal-close");
    const batchSearchInput = document.getElementById("batch-search");
    const batchBtnClear = document.getElementById("batch-btn-clear");
    const batchBtnDownloadAll = document.getElementById("batch-btn-download-all");
    const batchBtnPrev = document.getElementById("batch-btn-prev-invoice");
    const batchBtnNext = document.getElementById("batch-btn-next-invoice");
    const batchBtnDownloadSingle = document.getElementById("batch-btn-download-single");
    const batchBtnMarkDone = document.getElementById("batch-btn-mark-done");
    const batchInvoiceCounter = document.getElementById("batch-invoice-counter");

    // The ONE true invoice preview element — shared between single and batch modes
    const invoicePreviewEl = document.getElementById("invoice-preview");
    // Its original home (inside preview-section) — we return it here when modal closes
    const invoicePreviewHome = document.getElementById("preview-section");

    let batchInvoices = [];
    let batchCurrentIdx = 0;

    // ---- Template Download ----
    document.getElementById("batch-download-template").addEventListener("click", (e) => {
        e.preventDefault();
        const headers = [
            "inv_no","inv_date","inv_ref","inv_other_ref","inv_remarks",
            "c_name","c_address","c_gstin","c_state","c_state_code","c_contact","c_email",
            "b_name","b_address","b_gstin","b_state","b_state_code",
            "bank_name","bank_acc","bank_ifsc",
            "item1_particulars","item1_hsn","item1_gst","item1_qty","item1_rate","item1_per",
            "item2_particulars","item2_hsn","item2_gst","item2_qty","item2_rate","item2_per"
        ];
        const sample = [
            "IE/25-26/01","2026-01-15","IE/25-26/01 dt. 15-Jan-26","","INVOICE FOR JAN 26",
            "INFINITUM ENTERPRISES","1084 BHAKARVAD ROAD MEDEKHAR-402108","27CEJPP4736F1Z8","Maharashtra","27","9167076741","infinitum.india@gmail.com",
            "ATMOS CARE PVT LTD","G-2 SUMMET LOGISTICS BHIWANDI","27AANCA0147N1ZE","Maharashtra","27",
            "BANK OF INDIA","125520110000412","POYNAD BRANCH & BKID0001255",
            "RENTAL DESKTOP SET","997315","18","1","2800","No.",
            "SUPPORT SERVICES","998314","18","2","1500","Hrs"
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
        ws['!cols'] = headers.map(() => ({ wch: 22 }));
        XLSX.utils.book_append_sheet(wb, ws, "Invoices");
        XLSX.writeFile(wb, "Invoice_Template.xlsx");
    });

    // ---- File Upload ----
    batchFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const wb = XLSX.read(ev.target.result, { type: 'binary', cellDates: true });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
                const validRows = rows.filter(r => r.inv_no && String(r.inv_no).trim() !== "");
                if (!validRows.length) { alert("No valid data found in the file."); return; }
                batchInvoices = validRows.map(row => ({ data: row, status: 'pending' }));
                renderBatchList();
            } catch (err) {
                alert("Error reading file: " + err.message);
            }
        };
        reader.readAsBinaryString(file);
        batchFileInput.value = "";
    });

    // ---- Render the list table ----
    function renderBatchList(filter = "") {
        batchInvoiceTbody.innerHTML = "";
        if (!batchInvoices.length) {
            batchListWrapper.classList.add("hidden");
            batchEmptyState.classList.remove("hidden");
            return;
        }
        batchEmptyState.classList.add("hidden");
        batchListWrapper.classList.remove("hidden");

        const total = batchInvoices.length;
        const done = batchInvoices.filter(i => i.status === 'done').length;
        batchListSummary.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                <span>${total} invoices &nbsp;·&nbsp; <span style="color:#27ae60;">${done} done</span> &nbsp;·&nbsp; <span style="color:#e67e22;">${total - done} pending</span></span>
                <div class="batch-progress-bar-wrap" style="width:180px;">
                    <div class="batch-progress-bar" style="width:${total ? Math.round(done / total * 100) : 0}%"></div>
                </div>
                <span style="font-weight:400; color:#888;">${total ? Math.round(done / total * 100) : 0}% complete</span>
            </div>`;

        const q = filter.toLowerCase();
        batchInvoices.forEach((inv, idx) => {
            const d = inv.data;
            if (q && !String(d.inv_no || "").toLowerCase().includes(q) &&
                !String(d.b_name || "").toLowerCase().includes(q) &&
                !String(d.inv_date || "").toLowerCase().includes(q)) return;

            const items = extractItems(d);
            const { grandTotal } = calcTotals(items);
            const dateStr = formatExcelDate(d.inv_date);

            const tr = document.createElement("tr");
            if (inv.status === 'done') tr.classList.add("done-row");
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${d.inv_no || "—"}</strong></td>
                <td>${dateStr}</td>
                <td>${d.b_name || "—"}</td>
                <td>₹ ${grandTotal.toFixed(2)}</td>
                <td><span class="batch-status-badge ${inv.status === 'done' ? 'badge-done' : 'badge-pending'}">${inv.status === 'done' ? '✓ Done' : '⏳ Pending'}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-primary btn-sm" onclick="batchOpenPreview(${idx})">👁 Preview</button>
                        <button class="btn btn-success btn-sm" onclick="batchDownloadOne(${idx})">⬇ PDF</button>
                        <button class="btn btn-secondary btn-sm" onclick="batchToggleDone(${idx})">${inv.status === 'done' ? '↩ Undo' : '✓ Done'}</button>
                    </div>
                </td>`;
            batchInvoiceTbody.appendChild(tr);
        });
    }

    function formatExcelDate(val) {
        if (!val) return "—";
        let dateObj;
        if (val instanceof Date) {
            dateObj = new Date(val.getTime() + 12 * 60 * 60 * 1000);
        } else { 
            dateObj = new Date(val);
        }
        if (isNaN(dateObj)) return String(val);
        
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        return `${day} ${month} ${year}`;
    }

    function formatExcelDateForPreview(val) {
        // Returns "DD-Mon-YY" format matching the single invoice formatDate()
        if (!val) return "";
        let dateObj;
        if (val instanceof Date) {
            dateObj = new Date(val.getTime() + 12 * 60 * 60 * 1000);
        } else { 
            dateObj = new Date(val);
        }
        if (isNaN(dateObj)) return String(val);
        
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    }

    function extractItems(d) {
        const items = [];
        for (let i = 1; i <= 20; i++) {
            const p = d[`item${i}_particulars`];
            if (p === "" || p === undefined || p === null) break;
            items.push({
                particulars: String(p),
                hsn: String(d[`item${i}_hsn`] || ""),
                gst: parseFloat(d[`item${i}_gst`]) || 0,
                qty: parseFloat(d[`item${i}_qty`]) || 0,
                rate: parseFloat(d[`item${i}_rate`]) || 0,
                per: String(d[`item${i}_per`] || ""),
            });
        }
        return items;
    }

    function calcTotals(items) {
        let totalAmount = 0, totalCgst = 0, totalSgst = 0, taxMap = {};
        items.forEach(item => {
            const amount = item.qty * item.rate;
            totalAmount += amount;
            const cgst = amount * (item.gst / 2 / 100);
            const sgst = amount * (item.gst / 2 / 100);
            totalCgst += cgst;
            totalSgst += sgst;
            const key = `${item.hsn}-${item.gst}`;
            if (!taxMap[key]) taxMap[key] = { hsn: item.hsn, gstRate: item.gst, taxable: 0, cgstAmount: 0, sgstAmount: 0 };
            taxMap[key].taxable += amount;
            taxMap[key].cgstAmount += cgst;
            taxMap[key].sgstAmount += sgst;
        });
        return { totalAmount, totalCgst, totalSgst, taxMap, grandTotal: totalAmount + totalCgst + totalSgst };
    }

    // ---- Fill the ORIGINAL #invoice-preview element (prev-* IDs) with batch data ----
    // This is the exact same element used by generatePreview() for single invoices.
    function batchFillPreview(inv) {
        const d = inv.data;
        const items = extractItems(d);
        const { totalAmount, totalCgst, totalSgst, taxMap, grandTotal } = calcTotals(items);

        // Reuse the same helper and IDs as generatePreview()
        function st(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val || "";
        }

        st("prev-c-name", d.c_name);
        st("prev-c-address", d.c_address);
        st("prev-c-gstin", d.c_gstin);
        st("prev-c-state", d.c_state);
        st("prev-c-state-code", d.c_state_code);

        const contWrap = document.getElementById("contact-wrapper");
        const emailWrap = document.getElementById("email-wrapper");
        if (d.c_contact) { contWrap.style.display = "inline"; st("prev-c-contact", d.c_contact); }
        else { contWrap.style.display = "none"; }
        if (d.c_email) { emailWrap.style.display = "inline"; st("prev-c-email", d.c_email); }
        else { emailWrap.style.display = "none"; }

        st("prev-sign-company", d.c_name);
        st("prev-b-name", d.b_name);
        st("prev-b-address", d.b_address);
        st("prev-b-gstin", d.b_gstin);
        st("prev-b-state", d.b_state);
        st("prev-b-state-code", d.b_state_code);

        st("prev-inv-no", d.inv_no);
        st("prev-inv-date", formatExcelDateForPreview(d.inv_date));
        st("prev-inv-ref", d.inv_ref);
        st("prev-inv-other-ref", d.inv_other_ref);

        const remarksContainer = document.getElementById("remarks-container");
        if (d.inv_remarks) { st("prev-inv-remarks", d.inv_remarks); remarksContainer.style.display = "block"; }
        else { remarksContainer.style.display = "none"; }

        st("prev-bank-name", d.bank_name);
        st("prev-bank-acc", d.bank_acc);
        st("prev-bank-ifsc", d.bank_ifsc);

        // Items table — same logic as generatePreview()
        const prevItemsBody = document.getElementById("prev-items-body");
        const prevTaxBody = document.getElementById("prev-tax-body");
        prevItemsBody.innerHTML = "";
        prevTaxBody.innerHTML = "";

        let totalAmountCalc = 0;
        let totalCgstCalc = 0, totalSgstCalc = 0;
        const taxMapCalc = {};

        items.forEach((item, index) => {
            const amount = item.qty * item.rate;
            totalAmountCalc += amount;

            let formattedParticulars = item.particulars ? item.particulars.replace(/\r/g, '').split('\n').map((line, idx) => idx === 0 ? `<strong>${line}</strong>` : line).join('<br>') : '';

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${index + 1}</td>
                <td class="pt-1 pb-1 particulars-preview" style="vertical-align: top;">${formattedParticulars}</td>
                <td class="text-left pt-1 pb-1 pl-1" style="vertical-align: top;">${item.hsn}</td>
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${item.gst ? item.gst + ' %' : ''}</td>
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${item.qty}</td>
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${item.rate ? item.rate.toFixed(2) : ''}</td>
                <td class="text-center pt-1 pb-1" style="vertical-align: top;">${item.per}</td>
                <td class="text-right pt-1 pb-1 pr-1" style="vertical-align: top;"><strong>${amount.toFixed(2)}</strong></td>`;
            prevItemsBody.appendChild(tr);

            const key = `${item.hsn}-${item.gst}`;
            if (!taxMapCalc[key]) taxMapCalc[key] = { hsn: item.hsn, gstRate: item.gst, taxable: 0, cgstAmount: 0, sgstAmount: 0 };
            const cgstAmt = amount * (item.gst / 2 / 100);
            const sgstAmt = amount * (item.gst / 2 / 100);
            taxMapCalc[key].taxable += amount;
            taxMapCalc[key].cgstAmount += cgstAmt;
            taxMapCalc[key].sgstAmount += sgstAmt;
            totalCgstCalc += cgstAmt;
            totalSgstCalc += sgstAmt;
        });

        if (totalCgstCalc > 0) {
            const trC = document.createElement("tr");
            trC.innerHTML = `<td></td><td class="text-right pr-2"><strong>CGST</strong></td><td></td><td></td><td></td><td></td><td></td><td class="text-right pr-1"><strong>${totalCgstCalc.toFixed(2)}</strong></td>`;
            prevItemsBody.appendChild(trC);
        }
        if (totalSgstCalc > 0) {
            const trS = document.createElement("tr");
            trS.innerHTML = `<td></td><td class="text-right pr-2"><strong>SGST</strong></td><td></td><td></td><td></td><td></td><td></td><td class="text-right pr-1"><strong>${totalSgstCalc.toFixed(2)}</strong></td>`;
            prevItemsBody.appendChild(trS);
        }
        const fillerTR = document.createElement("tr");
        // Use a large filler; flex-grow and overflow:hidden will ensure fixed structure
        fillerTR.style.height = "500px";
        fillerTR.innerHTML = `<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
        prevItemsBody.appendChild(fillerTR);

        let totalTaxable = 0, grandTotalTax = 0;
        for (const key in taxMapCalc) {
            const t = taxMapCalc[key];
            const taxRowTotal = t.cgstAmount + t.sgstAmount;
            totalTaxable += t.taxable;
            grandTotalTax += taxRowTotal;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="text-left pl-1 border-right pt-0_5 pb-0_5">${t.hsn}</td>
                <td class="text-right pr-1 border-right pt-0_5 pb-0_5">${t.taxable.toFixed(2)}</td>
                <td class="text-center border-right pt-0_5 pb-0_5">${(t.gstRate / 2).toFixed(2)}%</td>
                <td class="text-right pr-1 border-right pt-0_5 pb-0_5">${t.cgstAmount.toFixed(2)}</td>
                <td class="text-center border-right pt-0_5 pb-0_5">${(t.gstRate / 2).toFixed(2)}%</td>
                <td class="text-right pr-1 border-right pt-0_5 pb-0_5">${t.sgstAmount.toFixed(2)}</td>
                <td class="text-right pr-1 pt-0_5 pb-0_5">${taxRowTotal.toFixed(2)}</td>`;
            prevTaxBody.appendChild(tr);
        }

        const grandTotalFinal = totalAmountCalc + totalCgstCalc + totalSgstCalc;
        document.getElementById("prev-total-amount").textContent = grandTotalFinal.toFixed(2);
        document.getElementById("prev-taxable-total").textContent = totalTaxable.toFixed(2);
        document.getElementById("prev-cgst-total").textContent = totalCgstCalc.toFixed(2);
        document.getElementById("prev-sgst-total").textContent = totalSgstCalc.toFixed(2);
        document.getElementById("prev-tax-total").textContent = grandTotalTax.toFixed(2);
        document.getElementById("prev-amount-words").textContent = convertNumberToWords(grandTotalFinal) + " Only";
        document.getElementById("prev-tax-words").textContent = convertNumberToWords(grandTotalTax) + " Only";
    }

    // ---- Open modal: move #invoice-preview physically into the modal slot, scaled ----
    window.batchOpenPreview = function(idx) {
        batchCurrentIdx = idx;
        batchFillPreview(batchInvoices[idx]);
        updateModalNav();

        // Move the real invoice element into the modal slot
        const slot = document.getElementById("batch-modal-invoice-slot");
        slot.appendChild(invoicePreviewEl);

        // Scale to fit modal width
        applyModalScale();

        batchModalOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    };

    function applyModalScale() {
        const slot = document.getElementById("batch-modal-invoice-slot");
        // invoicePreviewEl natural width is 210mm ≈ 794px
        const naturalWidth = invoicePreviewEl.scrollWidth || 794;
        const available = slot.clientWidth || 760;
        const scale = Math.min(1, available / naturalWidth);

        invoicePreviewEl.style.transformOrigin = "top left";
        invoicePreviewEl.style.transform = `scale(${scale})`;
        invoicePreviewEl.style.marginBottom = `-${invoicePreviewEl.scrollHeight * (1 - scale)}px`;
        // Remove box shadow in modal context
        invoicePreviewEl.style.boxShadow = "none";
    }

    // ---- Close modal: return #invoice-preview to its original home ----
    function closeModal() {
        // Restore original styles before moving back
        invoicePreviewEl.style.transform = "";
        invoicePreviewEl.style.transformOrigin = "";
        invoicePreviewEl.style.marginBottom = "";
        invoicePreviewEl.style.boxShadow = "";

        // Return to original parent
        invoicePreviewHome.appendChild(invoicePreviewEl);

        batchModalOverlay.classList.add("hidden");
        document.body.style.overflow = "";
        renderBatchList(batchSearchInput.value);
    }

    function updateModalNav() {
        batchInvoiceCounter.textContent = `Invoice ${batchCurrentIdx + 1} of ${batchInvoices.length}`;
        batchBtnPrev.disabled = batchCurrentIdx === 0;
        batchBtnNext.disabled = batchCurrentIdx === batchInvoices.length - 1;
        const isDone = batchInvoices[batchCurrentIdx].status === 'done';
        batchBtnMarkDone.textContent = isDone ? '↩ Mark Pending' : '✓ Mark Done';
        batchBtnMarkDone.style.background = isDone ? '#95a5a6' : '#9b59b6';
    }

    batchBtnPrev.addEventListener("click", () => {
        if (batchCurrentIdx > 0) {
            batchCurrentIdx--;
            batchFillPreview(batchInvoices[batchCurrentIdx]);
            updateModalNav();
            applyModalScale();
        }
    });
    batchBtnNext.addEventListener("click", () => {
        if (batchCurrentIdx < batchInvoices.length - 1) {
            batchCurrentIdx++;
            batchFillPreview(batchInvoices[batchCurrentIdx]);
            updateModalNav();
            applyModalScale();
        }
    });

    batchBtnMarkDone.addEventListener("click", () => {
        batchInvoices[batchCurrentIdx].status =
            batchInvoices[batchCurrentIdx].status === 'done' ? 'pending' : 'done';
        updateModalNav();
        renderBatchList(batchSearchInput.value);
    });

    batchBtnDownloadSingle.addEventListener("click", () => downloadInvoicePDF(batchCurrentIdx));

    window.batchDownloadOne = function(idx) { downloadInvoicePDF(idx); };
    window.batchToggleDone = function(idx) {
        batchInvoices[idx].status = batchInvoices[idx].status === 'done' ? 'pending' : 'done';
        renderBatchList(batchSearchInput.value);
    };

    // ---- PDF download: restore element to natural size, capture, then re-scale for modal ----
    function downloadInvoicePDF(idx) {
        const inv = batchInvoices[idx];
        batchFillPreview(inv);

        // Temporarily restore natural width for capture
        invoicePreviewEl.style.transform = "";
        invoicePreviewEl.style.transformOrigin = "";
        invoicePreviewEl.style.marginBottom = "";
        invoicePreviewEl.style.boxShadow = "";

        const invoiceNo = String(inv.data.inv_no || "Draft").replace(/[^a-z0-9]/gi, '_');
        html2pdf().set({
            margin: 0,
            filename: `Invoice_${invoiceNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        }).from(invoicePreviewEl).save().then(() => {
            batchInvoices[idx].status = 'done';
            renderBatchList(batchSearchInput.value);
            if (batchCurrentIdx === idx) updateModalNav();
            // Re-apply scale if modal is still open
            if (!batchModalOverlay.classList.contains("hidden")) {
                applyModalScale();
            }
        });
    }

    batchBtnDownloadAll.addEventListener("click", async () => {
        const pending = batchInvoices.filter(i => i.status !== 'done');
        if (!pending.length) { alert("All invoices already downloaded!"); return; }
        if (!confirm(`Download ${pending.length} pending invoice(s) as separate PDFs?`)) return;

        // Temporarily move invoice element to body for natural-width capture if modal closed
        const wasInModal = !batchModalOverlay.classList.contains("hidden");
        if (!wasInModal) {
            // ensure element is rendered at natural width — it lives in preview-section (hidden is fine)
        }

        for (let i = 0; i < batchInvoices.length; i++) {
            if (batchInvoices[i].status !== 'done') {
                await new Promise(resolve => {
                    batchFillPreview(batchInvoices[i]);
                    invoicePreviewEl.style.transform = "";
                    invoicePreviewEl.style.transformOrigin = "";
                    invoicePreviewEl.style.marginBottom = "";
                    invoicePreviewEl.style.boxShadow = "";

                    const invoiceNo = String(batchInvoices[i].data.inv_no || `Draft_${i + 1}`).replace(/[^a-z0-9]/gi, '_');
                    html2pdf().set({
                        margin: 0,
                        filename: `Invoice_${invoiceNo}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
                    }).from(invoicePreviewEl).save().then(() => {
                        batchInvoices[i].status = 'done';
                        renderBatchList(batchSearchInput.value);
                        resolve();
                    });
                });
                await new Promise(r => setTimeout(r, 700));
            }
        }
        if (wasInModal) applyModalScale();
        alert("All PDFs downloaded!");
    });

    batchModalClose.addEventListener("click", closeModal);
    batchModalOverlay.addEventListener("click", (e) => {
        if (e.target === batchModalOverlay) closeModal();
    });

    batchBtnClear.addEventListener("click", () => {
        if (confirm("Clear all imported invoices?")) { batchInvoices = []; renderBatchList(); }
    });
    batchSearchInput.addEventListener("input", () => renderBatchList(batchSearchInput.value));

    // ===== END BATCH IMPORT FEATURE =====
});
