import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { enGB } from "date-fns/locale"; // ✅ Fix: Ensure locale is defined
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `https://dream-nest-azure.vercel.app/properties/${listingId}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to fetch listing");

      const data = await response.json();
      if (!data) throw new Error("Listing not found");

      setListing(data);
      setLoading(false);
    } catch (err) {
      setError("Fetch Listing Details Failed. Try Again.");
      console.error("Fetch Listing Details Failed", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, [listingId]); // ✅ Fix: Add `listingId` as dependency

  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const start = dateRange[0]?.startDate || new Date(); // ✅ Fix: Handle undefined dates
  const end = dateRange[0]?.endDate || new Date();
  const dayCount = Math.max(Math.round((end - start) / (1000 * 60 * 60 * 24)), 1);

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!listing || !customerId || !listing.creator) {
      setError("Booking failed. Missing listing, host, or user information.");
      return;
    }

    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalPrice: listing.price * dayCount,
      };

      const response = await fetch(
        `https://dream-nest-azure.vercel.app/bookings/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingForm),
        }
      );

      if (!response.ok) throw new Error("Booking request failed");

      navigate(`/${customerId}/trips`);
    } catch (err) {
      setError("Submit Booking Failed. Try Again.");
      console.error("Submit Booking Failed.", err.message);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <div className="listing-details">
        {error && <p className="error">{error}</p>}

        <div className="title">
          <h1>{listing.title}</h1>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item, index) => (
            <img
              key={index}
              src={`https://dream-nest-azure.vercel.app/${item.replace("public/", "")}`} // ✅ Fix: Ensure correct image URL
              alt="listing"
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province}, {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <h3>
            Hosted by {listing.creator?.firstName || "Unknown"} {listing.creator?.lastName || "User"} {/* ✅ Fix: Handle missing creator */}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities?.[0]?.split(",").map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {facilities.find((facility) => facility.name === item)?.icon}
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <DateRange
              ranges={dateRange}
              onChange={handleSelect}
              minDate={new Date()}
              locale={enGB} // ✅ Fix: Ensure localization is set properly
            />
            <p>Total Days: {dayCount}</p>
            <p>Total Price: ${listing.price * dayCount}</p>

            <button onClick={handleSubmit}>Book Now</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;
