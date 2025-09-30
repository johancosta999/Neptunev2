const QRCode = require("qrcode");

const generateUserQR = async (req, res) => {
    const userId = req.params.userId;

    try {
        const profileUrl = "";
        const qrImage = await QRCode.toDataURL(profileUrl);

        res.json({ qrCode: qrImage, url: profileUrl });
    } catch (err) {
        res.status(500).json({ eroor: err.message });
    }
};

module.exports = { generateUserQR };