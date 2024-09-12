// user Roles
const SystemRoles = {
    ADMIN: 'admin',
    USER: 'user',
}

// user 
const Gender = {
    Male: 'male',
    Female: 'female'
}

// Product
const Badgs = {
    New: 'New',
    Sale: 'Sale',
    Best_Seller: 'Best Seller'
}

const DiscountType = {
    Percentage: 'Percentage',
    Fixed: 'Fixed'
}


// Coupon
const CouponType = {
    Percentage: 'Percentage',
    Fixed: 'Fixed'
}


// Fields Name 
const Fields = {
    _id: '_id',
    Name: 'name',
    Email: 'email',
    Category: "category",
    SubCategory: "subCategory",
    Brand: "brand",
    User: "user",
    Category_SubCategory: "category subCategory",
    Is_Marked_As_Deleted: "isMarkedAsDeleted",
    Coupon_Code: "couponCode",
    Coupon_id: "couponId"
}

const PaymentMethods = {
    Stripe: 'stripe',
    Paymob: 'paymob',
    Cash: 'cash'
}

const OrderSatus = {
    Pending: 'pending',
    Shipped: 'shipped',
    Delivered: 'delivered',
    Canceled: 'canceled',
    Placed: 'placed',
    Confirmend: 'confirmend',
    Refunded: 'refunded',
    Returned: 'returned',
    Dropped: 'dropped',
    OnWay: 'onWay'
}

export {
    SystemRoles,
    Gender,
    Badgs,
    DiscountType,
    CouponType,
    Fields,
    PaymentMethods,
    OrderSatus
}