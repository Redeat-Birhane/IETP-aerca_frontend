import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const CartIcon = () => {
  const { totalItems } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="cart-icon" onClick={() => navigate("/cart")}>
      <img src="/cart-icon.svg" alt="Cart" style={{ width: "30px" }} />
      {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
    </div>
  );
};

export default CartIcon;
