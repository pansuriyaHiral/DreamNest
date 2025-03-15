const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Listing = require("../models/Listing");
const User = require("../models/User");

const router = express.Router();

/* Ensure Upload Directory Exists */
const uploadDir = "public/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* Multer Configuration */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
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

        /* Validate User Exists */
        const userExists = await User.findById(creator);
        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID. User does not exist." });
        }

        /* Ensure Files Were Uploaded */
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded." });
        }

        /* Process Image Paths */
        const listingPhotoPaths = req.files.map((file) => file.path.replace("public/", ""));

        /* Create Listing */
        const newListing = new Listing({
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
            listingPhotoPaths,
            title,
            description,
            highlight,
            highlightDesc,
            price,
        });

        await newListing.save();
        res.status(201).json(newListing);
    } catch (err) {
        res.status(500).json({ message: "Failed to create listing", error: err.message });
        console.error(err);
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
        res.status(500).json({ message: "Error fetching listing", error: err.message });
    }
});

module.exports = router;
