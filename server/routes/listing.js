const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User");

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
    try {
        const {
            creator,
            category,
            type,
            streetAddress,
            aptSuite,
            city,
            province,
            country,
            guestCount,
            bedroomCount,
            bedCount,
            bathroomCount,
            amenities,
            title,
            description,
            highlight,
            highlightDesc,
            price,
        } = req.body;

        const listingPhotos = req.files;
        if (!listingPhotos) {
            return res.status(400).send("No file uploaded.");
        }

        const listingPhotoPaths = listingPhotos.map((file) => file.path.replace("public/", "")); // ✅ Fix: Correct file path

        const newListing = new Listing({
            creator,
            category,
            type,
            streetAddress,
            aptSuite,
            city,
            province,
            province,
            country,
            guestCount,
            bedroomCount,
            bedCount,
            bathroomCount,
            amenities,
            listingPhotoPaths,
            title,
            description,
            highlight,
            highlightDesc,
            price,
        });

        await newListing.save();
        res.status(200).json(newListing);
    } catch (err) {
        res.status(409).json({ message: "Fail to create Listing", error: err.message });
        console.log(err);
    }
});

/* GET LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
    try {
        const { listingId } = req.params;
        const listing = await Listing.findById(listingId).populate("creator");
        if (!listing) {
            return res.status(404).json({ message: "Listing not found!" });
        }
        res.status(200).json(listing);
    } catch (err) {
        res.status(404).json({ message: "Listing cannot be found!", error: err.message });
    }
});

module.exports = router;
