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
            <input type="text" class="i-per" placeholder="per" style="flex: 1 1 60px;">
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
        fillerTR.style.height = "180px"; // Adjust height to stretch to bottom
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
            margin: [10, 5, 10, 5],
            filename: `Invoice_${invoiceNo.replace(/[^z0-9]/gi, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
});
