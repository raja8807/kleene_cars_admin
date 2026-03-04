/**
 * Calculates the price breakdown for an order based on its items and resource availability.
 * @param {Object} order - The order object containing OrderItems.
 * @returns {Object} - An object with subtotal, resourceCharges, and totalAmount.
 */
export const calculateOrderPrice = (order) => {
    let resourceCharges = 0;
    let baseSubtotal = 0;

    order?.OrderItems?.forEach((item) => {
        const itemBasePrice = Number(item.ServiceDetail?.discount_price || item.price || 0);
        const quantity = Number(item.quantity || 1);
        baseSubtotal += itemBasePrice * quantity;

        if (item.item_type === "service" && item.ServiceDetail) {
            if (item.ServiceDetail.water_required && !item.water_available) {
                resourceCharges += Number(item.ServiceDetail.water_price || 0) * quantity;
            }
            if (
                item.ServiceDetail.electricity_required &&
                !item.electricity_available
            ) {
                resourceCharges += Number(item.ServiceDetail.electricity_price || 0) * quantity;
            }
        }
    });

    const subtotal = baseSubtotal;
    const totalAmount = subtotal + resourceCharges;

    return { subtotal, resourceCharges, totalAmount };
};
