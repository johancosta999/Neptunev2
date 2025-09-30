import React, { useEffect, useState } from 'react';
import axios from "axios"
import { useNavigate, Link } from 'react-router-dom';
import "../Seller/AddSeller.css"

function AddSeller() {

    const history = useNavigate();
    const [inputs, setInputs] = useState({
        tankId: "",
        customerName: "",
        address: "",
        city: "",
        customerEmail: "",
        sellDate: "",
        nicNumber: "",
        contactNumber: "",
        capacity: "",
        price: "",
        warranty: "",
        description: "",
        invoiceNumber: "",
        password: ""
    });

    const [errors, setErrors] = useState({});

	// Generate a human-readable, mostly-unique Tank ID
	const generateTankId = () => {
		const now = new Date();
		const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
		const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
		return `TNK-${ymd}-${rand}`;
	};

	// Initialize tankId on mount
	useEffect(() => {
		setInputs(prev => ({ ...prev, tankId: generateTankId() }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

    // Price mapping based on capacity
    const priceMap = {
        "350": 12000,
        "500": 17000,
        "750": 23000,
        "1000": 30000,
        "1500": 40000
    };

    const validateField = (name, value) => {
        switch (name) {
            case "customerName":
                if (!/^[A-Za-z\s]+$/.test(value)) return "Name can only include letters and spaces";
                return "";

            case "city":
                if (!/^[A-Za-z\s]+$/.test(value)) return "Name can only include letters and spaces";
                return "";

            case "customerEmail":
                if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
                return "";
            case "sellDate":
                const today = new Date();
                const inputDate = new Date(value);
                today.setHours(0,0,0,0);
                inputDate.setHours(0,0,0,0);
                if (inputDate.getTime() !== today.getTime()) return "Sell date must be today";
                return "";
            case "nicNumber":
                if (!/^\d{12}$/.test(value)) return "NIC number must be 12 digits";
                return "";
            case "invoiceNumber":
                if (!/^\d+$/.test(value)) return "Invoice number must include only numbers";
                return "";
            default:
                return "";
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedInputs = {
            ...inputs,
            [name]: value
        };

        // Automatically update price if capacity changes
        if (name === "capacity") {
            updatedInputs.price = priceMap[value] || 0;
        }

        setInputs(updatedInputs);

        setErrors({
            ...errors,
            [name]: validateField(name, value)
        });
    };

    const sendRequest = async () => {
        await axios.post("http://localhost:5000/api/sellers", {
            ...inputs,
            capacity: Number(inputs.capacity),
            price: Number(inputs.price),
            warranty: Number(inputs.warranty)
        }).then(res => res.data);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(inputs).forEach(key => {
            const errMsg = validateField(key, inputs[key]);
            if (errMsg) newErrors[key] = errMsg;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert("Fix errors before submitting!");
            return;
        }

        sendRequest()
            .then(() => {
                alert("Seller added successfully!");
                const phoneNumber = inputs.contactNumber.startsWith("+") 
                    ? inputs.contactNumber 
                    : "+94" + inputs.contactNumber;
                const message = `Hello ${inputs.customerName}! Your tank has been registered.\nTank ID: ${inputs.tankId}\nPassword: ${inputs.password}`;
                window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, "_blank");

				setInputs({
					tankId: generateTankId(),
                    customerName: "",
                    address: "",
                    city: "",
                    customerEmail: "",
                    sellDate: "",
                    nicNumber: "",
                    contactNumber: "",
                    capacity: "",
                    price: "",
                    warranty: "",
                    description: "",
                    invoiceNumber: "",
                    password: ""
                });

                setErrors({});
                history("/seller/dashboard");
            })
            .catch(err => {
                console.error("Error: ", err);
                alert("Failed to add seller");
            });
    };

    return (
        <div>
            <Link to={"/seller/dashboard"}>
                <button className='back-btn'>Back</button>
            </Link>

            <form onSubmit={handleSubmit}>
                <h1>Add Tanks</h1>

                <label>Tank ID:</label>
                <input type="text" name="tankId" value={inputs.tankId} onChange={handleChange} required readOnly />
                {errors.tankId && <span className="error">{errors.tankId}</span>} <br/>

                <label>Customer Name:</label>
                <input type="text" name="customerName" value={inputs.customerName} onChange={handleChange} required />
                {errors.customerName && <span className="error">{errors.customerName}</span>} <br/>

                <label>Address:</label>
                <input type="text" name="address" value={inputs.address} onChange={handleChange} required /> <br/>

                <label>City:</label>
                <input type="text" name="city" value={inputs.city} onChange={handleChange} required /> <br/>

                <label>Email:</label>
                <input type="email" name="customerEmail" value={inputs.customerEmail} onChange={handleChange} required />
                {errors.customerEmail && <span className="error">{errors.customerEmail}</span>} <br/>

                <label>Sell Date:</label>
                <input type="date" name="sellDate" value={inputs.sellDate} onChange={handleChange} required />
                {errors.sellDate && <span className="error">{errors.sellDate}</span>} <br/>

                <label>NIC Number:</label>
                <input type="text" name="nicNumber" value={inputs.nicNumber} onChange={handleChange} required />
                {errors.nicNumber && <span className="error">{errors.nicNumber}</span>} <br/>

                <label>Contact Number:</label>
                <input type="number" name="contactNumber" value={inputs.contactNumber} onChange={handleChange} required /> <br/>

                <label>Capacity:</label>
                <select name="capacity" value={inputs.capacity} onChange={handleChange} required>
                    <option value="">Select Capacity</option>
                    <option value="350">AquaLite - 350L</option>
                    <option value="500">HydroMax - 500L</option>
                    <option value="750">BlueWave - 750L</option>
                    <option value="1000">OceanPro - 1000L</option>
                    
                </select> <br/>

                <label>Price (auto):</label>
                <input type="number" name="price" value={inputs.price} readOnly /> <br/>

                <label>Warranty:</label>
                <select name="warranty" value={inputs.warranty} onChange={handleChange} required>
                    <option value="">Select Warranty</option>
                    <option value="5">5 years</option>
                    <option value="10">10 years</option>
                </select> <br/>

                <label>Description:</label>
                <input type="text" name="description" value={inputs.description} onChange={handleChange} required /> <br/>

                <label>Invoice Number:</label>
                <input type="number" name="invoiceNumber" value={inputs.invoiceNumber} onChange={handleChange} required />
                {errors.invoiceNumber && <span className="error">{errors.invoiceNumber}</span>} <br/>

                <label>Password:</label>
                <input type="text" name="password" value={inputs.password} onChange={handleChange} required /> <br/>

                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default AddSeller;
