import React, { useState } from "react";
import api from "../api";
import "../styles.css";

function TraceabilityForm({ onError }) {
  const [formData, setFormData] = useState({
    // PRODUCT
    gtin: "",
    description: "",
    commercialLot: "",
    sanitaryLot: "",
    quantity: "",
    unit: "",

    // PRODUCTION
    countryOfOrigin: "",
    productionSiteName: "",
    productionSiteAddress: "",
    sanitaryApprovalNumber: "",
    productionDate: "",
    harvestDate: "",

    // SHIPPING
    shipperName: "",
    shipperAddress: "",
    shipperGLN: "",
    shippingDateTime: "",
    transportMode: "",
    transportTemperature: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/traceability", formData);
      alert("Record created successfully ✅");

      // Reset form
      setFormData({
        gtin: "",
        description: "",
        commercialLot: "",
        sanitaryLot: "",
        quantity: "",
        unit: "",
        countryOfOrigin: "",
        productionSiteName: "",
        productionSiteAddress: "",
        sanitaryApprovalNumber: "",
        productionDate: "",
        harvestDate: "",
        shipperName: "",
        shipperAddress: "",
        shipperGLN: "",
        shippingDateTime: "",
        transportMode: "",
        transportTemperature: "",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error creating record ❌";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get("/api/traceability/export/excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "traceability.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Download failed ❌");
    }
  };

  return (
    <div className="container">
      <h2>Traceability Management System</h2>

      <form onSubmit={handleSubmit} className="form-card">

        {/* PRODUCT SECTION */}
        <h3>Product Information</h3>
<div className="form-grid">

  <div className="form-group">
    <label>GTIN</label>
    <input name="gtin" value={formData.gtin} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Description</label>
    <input name="description" value={formData.description} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Commercial Lot</label>
    <input name="commercialLot" value={formData.commercialLot} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Sanitary Lot</label>
    <input name="sanitaryLot" value={formData.sanitaryLot} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Quantity</label>
    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Unit</label>
    <input name="unit" value={formData.unit} onChange={handleChange} />
  </div>

</div>

        {/* PRODUCTION SECTION */}
     <h3>Production Information</h3>
<div className="form-grid">

  <div className="form-group">
    <label>Country of Origin</label>
    <input name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Production Site Name</label>
    <input name="productionSiteName" value={formData.productionSiteName} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Production Site Address</label>
    <input name="productionSiteAddress" value={formData.productionSiteAddress} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Sanitary Approval Number</label>
    <input name="sanitaryApprovalNumber" value={formData.sanitaryApprovalNumber} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Production Date</label>
    <input type="date" name="productionDate" value={formData.productionDate} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Harvest Date</label>
    <input type="date" name="harvestDate" value={formData.harvestDate} onChange={handleChange} />
  </div>

</div>

        {/* SHIPPING SECTION */}
        <h3>Shipping Information</h3>
<div className="form-grid">

  <div className="form-group">
    <label>Shipper Name</label>
    <input name="shipperName" value={formData.shipperName} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Shipper Address</label>
    <input name="shipperAddress" value={formData.shipperAddress} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Shipper GLN</label>
    <input name="shipperGLN" value={formData.shipperGLN} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Shipping Date & Time</label>
    <input type="datetime-local" name="shippingDateTime" value={formData.shippingDateTime} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Transport Mode</label>
    <input name="transportMode" value={formData.transportMode} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Transport Temperature (°C)</label>
    <input type="number" step="0.1" name="transportTemperature" value={formData.transportTemperature} onChange={handleChange} />
  </div>

</div>
        <div className="button-row">
          <button type="submit" className="btn primary">
            Create Record
          </button>

          <button type="button" onClick={handleDownload} className="btn secondary">
            Download Excel
          </button>
        </div>

      </form>
    </div>
  );
}

export default TraceabilityForm;