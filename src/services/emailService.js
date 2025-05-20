const email = require('../../configs/email.json')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: email.SERVICE,
  auth: {
    user: email.USER,
    pass: email.PASS
  }
});

class EmailBuilder {
    constructor(items) {
        this.items = items;
        this.html = '';
    }

    addHeader(text) {
        this.html += `<h1>${text}</h1>`;
        return this;
    }

    addUserParagraph(name) {
        this.html += `<p>Dear ${name}</p>`;
        this.html += `<p>Thank you for your purchase! Here is the summary of your order:</p>`;
        return this;
    }

    addItemList() {
        this.html += `<ul>`;
        this.items.forEach(({item, attraction}) => {
            this.html += `<li>
                        <strong>${item.event.name}, at ${attraction.name}</strong><br>
                        ${item.event.description}<br>
                        <img src="https://storage.googleapis.com/tripvault-attractions/${attraction.photo_path}" alt="${item.event.name}" style="width: 100px; height: auto;"><br>
                        Quantity: ${item.quantity}<br>
                        Total Price: $${(item.quantity * item.event.price).toFixed(2)}<br>
                        <p style="font-style: italic;">Available from ${new Date(item.event.startDate).toLocaleDateString()} until ${new Date(item.event.endDate).toLocaleDateString()}</p>
                    </li><br>`;
        });
        this.html += `</ul>`;
        return this;
    }

    addTotalPrice() {
        this.html += `<p>Total amount: $${this.items.reduce((acc, {item, attraction}) => acc + item.quantity * item.event.price, 0).toFixed(2)}</p>`;
        return this;
    }

    addFooter() {
        this.html += '<strong>You will find the tickets attached to this email.</strong><br><br>'
        this.html += `<p>We hope you enjoy the events!</p>`;
        this.html += `<p style="font-style: italic;">Best regards,<br>Alex Ignat from Attractions Team</p><br>`;
        this.html += '<img src="https://storage.googleapis.com/tripvault/logo.png" alt="Logo" style="width: 100px; height: auto;">'
        this.html += `<br><br><br><p style="font-size: 10px;">This is an automatically generated email. Please do not reply to it.</p>`;
        return this;
    }

    build() {
        return this.html;
    }
}

module.exports = {
    email,
    transporter,
    EmailBuilder
};