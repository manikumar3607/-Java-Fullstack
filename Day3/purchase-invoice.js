/***************************************
 PO → Invoice → Overdue System
 Business Rules Implemented
 ***************************************/

// 3 Letters + 3 Numbers (ABC123)
function generateDocumentNumber() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let result = "";

    for (let i = 0; i < 3; i++) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    for (let i = 0; i < 3; i++) {
        result += numbers[Math.floor(Math.random() * numbers.length)];
    }
    return result;
}

// Calculate amount
function calculateAmount(paymentType, rate, duration) {
    if (paymentType === "hourly") return rate * duration.hours;
    if (paymentType === "daily") return rate * duration.days;
    if (paymentType === "monthly") return rate * duration.months;
    return 0;
}

// Create PO
function createPO(trainer, training, paymentType, rate, duration) {
    return {
        poNumber: generateDocumentNumber(),
        trainer,
        training,
        paymentType,
        rate,
        duration,
        totalAmount: calculateAmount(paymentType, rate, duration),
        createdDate: new Date(),
        status: "ACTIVE"
    };
}

// Check Training Status
function getTrainingStatus(training) {
    const today = new Date();
    const endDate = new Date(training.endDate);

    if (today <= endDate) {
        return "IN_PROGRESS";
    }
    return "COMPLETED";
}

// Raise Invoice only NEXT DAY after training end
function generateInvoice(po) {
    const today = new Date();
    const endDate = new Date(po.training.endDate);

    const nextDayAfterEnd = new Date(endDate);
    nextDayAfterEnd.setDate(endDate.getDate() + 1);

    // Training still running
    if (today <= endDate) {
        console.log("❌ Training is in progress. Invoice cannot be raised.");
        return null;
    }

    // Training ended but today is not next day yet
    if (today < nextDayAfterEnd) {
        console.log("⏳ Invoice can be raised only from the next day after training end.");
        return null;
    }

    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);

    return {
        invoiceNumber: generateDocumentNumber(),
        poNumber: po.poNumber,
        trainerName: po.trainer.name,
        course: po.training.course,
        amount: po.totalAmount,
        invoiceDate: today,
        dueDate: dueDate,
        status: "UNPAID"
    };
}

// Send Email Alert
function sendOverdueEmail(invoice) {
    console.log("📧 EMAIL ALERT");
    console.log("Invoice:", invoice.invoiceNumber);
    console.log("Status: OVERDUE");
    console.log("Message: Invoice is pending for more than 30 days. Please pay immediately.");
}

// Check Overdue
function checkInvoiceOverdue(invoice) {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);

    if (today > dueDate) {
        if (invoice.status !== "PAID") {
            invoice.status = "OVERDUE";
            sendOverdueEmail(invoice);
        }
    } else {
        console.log("🕒 Invoice is NOT overdue yet");
        console.log("Due Date:", dueDate.toDateString());
    }
}



/*********************************
 SYSTEM DEMO
 *********************************/

// Trainer
const trainer = {
    name: "Sharath Kumar",
    email: "sharath@trainer.com",
    experience: "10 Years"
};

// Training
const training = {
    course: "Advanced React",
    client: "UST Global",
    startDate: "2025-12-01",
    endDate: "2026-02-08"
};

// Create PO
const po = createPO(trainer, training, "daily", 8000, { days: 40 });

console.log("📄 PO Created:", po);

// Check training status
const status = getTrainingStatus(training);
console.log("📊 Training Status:", status);

// Try to generate invoice
const invoice = generateInvoice(po);

if (invoice) {
    console.log("🧾 Invoice Generated:", invoice);

    // Simulate overdue
    // invoice.dueDate = "2025-01-01"; // past date
    checkInvoiceOverdue(invoice);
}