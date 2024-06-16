const sgMail = require('@sendgrid/mail');
const { crawl } = require('./crawler');

const targetUrl = 'aHR0cHM6Ly9wcm9kdWN0aW9uLmRhdGF2aXouY25uLmlvL2luZGV4L2ZlYXJhbmRncmVlZC9ncmFwaGRhdGE=';

// serveral static fields for console color into background.
const Reset = "\x1b[0m";
const BgRed = "\x1b[41m";
const BgGreen = "\x1b[42m";

(async () => {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const EMAIL_TO = process.env.EMAIL_TO;
    const SENDGRID_FROM = process.env.SENDGRID_FROM;
    const FNG_MIN = parseFloat(process.env.FNG_MIN || -1);
    const FNG_MAX = parseFloat(process.env.FNG_MAX || -1);

    if (!SENDGRID_API_KEY) {
        console.log(`${BgRed}%s${Reset}`, "Please set SENDGRID_API_KEY");
        process.exit(1);
    }

    if (!SENDGRID_FROM) {
        console.log(`${BgRed}%s${Reset}`, "Please set SENDGRID_FROM");
        process.exit(1);
    }

    if (!EMAIL_TO) {
        console.log(`${BgRed}%s${Reset}`, "Please set EMAIL_TO");
        process.exit(1);
    }

    if (FNG_MAX < 0 || FNG_MIN < 0) {
        console.log(`${BgRed}%s${Reset}`, "Please set FNG_MIN and FNG_MAX");
        process.exit(1);
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    const result = await crawl(Buffer.from(targetUrl, 'base64').toString('utf-8'));
    console.log("FNG for today is: ", result);

    const msg = {
        to: EMAIL_TO,
        from: SENDGRID_FROM,
        subject: 'Daily FNG Result',
        text: `FNG for today is: ${result}`,
    };

    if (result <= FNG_MIN || result >= FNG_MAX) {
        console.log(`${BgRed}%s${Reset}`, "FNG is out of range, pls check your stock account.");
        process.exit(1);
    }

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(`${BgRed}%s${Reset}`, "Failed to send email:", error);
    }

    process.exit(0);
})();
