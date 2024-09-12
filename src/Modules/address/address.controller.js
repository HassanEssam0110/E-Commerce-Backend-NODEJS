import { Address } from "../../../DB/Models/index.js";
import { catchError } from "../../Middlewares/index.js";
import { ApiError, sendResponse } from "../../Utils/index.js";


/**
 * @description   Add user Address.
 * @route {PUT} /api/v1/addresses/add
 *  @access Private
 */
export const addAddress = catchError(async (req, res, next) => {
    const { country, city, postalCode, buildingNumber, floorNumber, addressLabel, setIsDefault } = req.body;
    const user = req.user;

    //todo city validation
    const addressObject = new Address({
        user: user._id, country, city, postalCode, buildingNumber, floorNumber, addressLabel,
        isDefault: [true, false].includes(setIsDefault) ? setIsDefault : false
    });

    // if new address is default, we need to remove old default address
    if (addressObject.isDefault) {
        await Address.updateOne({ user: user._id, isDefault: true }, { isDefault: false });
    }

    const newAddress = await addressObject.save();
    return sendResponse(res, { data: newAddress }, 201);
});


/**
 * @description   Update user Address by Id.
 * @route {PUT} /api/v1/addresses/update/:_id
 *  @access Private
 */
export const updateAddress = catchError(async (req, res, next) => {
    const user = req.user;
    const address = req.document;

    if (address.isMarkedAsDeleted) {
        return next(new ApiError(`This address is already deleted.`, 404, `This address is already deleted.`, 'update Address controller '))
    };

    if (address.user.toString() !== user._id.toString()) {
        return next(new ApiError(`You are not allowed to update this address.`, 401, `You are not allowed to update this address.`, 'update Address controller '))
    };

    const { country, city, postalCode, buildingNumber, floorNumber, addressLabel, setIsDefault } = req.body;

    if (country) address.country = country;
    if (city) address.city = city;
    if (postalCode) address.postalCode = postalCode;
    if (buildingNumber) address.buildingNumber = buildingNumber;
    if (postalCode) address.postalCode = postalCode;
    if (floorNumber) address.floorNumber = floorNumber;
    if (addressLabel) address.addressLabel = addressLabel;
    if ([true, false].includes(setIsDefault)) {
        address.isDefault = [true, false].includes(setIsDefault) ? setIsDefault : false;
        // if address is default, we need to remove old default address
        await Address.updateOne({ user: user._id, isDefault: true }, { isDefault: false });
    }

    const updatedAddress = await address.save();
    return sendResponse(res, { data: updatedAddress });
});

/**
 * @description   Remove user Address by Id.
 * @route {PATCH} /api/v1/addresses/delete/:_id
 *  @access Private
 */
export const deleteAddress = catchError(async (req, res, next) => {
    const user = req.user;
    const address = req.document;

    if (address.isMarkedAsDeleted) {
        return next(new ApiError(`This address is already deleted.`, 404, `This address is already deleted.`, 'delete Address controller '))
    };

    if (address.user.toString() !== user._id.toString()) {
        return next(new ApiError(`You are not allowed to delete this address.`, 401, `You are not allowed to delete this address.`, 'delete Address controller '))
    };

    address.isMarkedAsDeleted = true;
    address.isDefault = false;

    const deletedAddress = await address.save();
    return sendResponse(res);
});

/**
 * @description   Get all user addresses.
 * @route {GET} /api/v1/addresses
 *  @access Private
 */
export const getAddresses = catchError(async (req, res, next) => {
    const user = req.user;
    console.log(user._id);
    const addresses = await Address.find({ user: user._id, isMarkedAsDeleted: false });
    return sendResponse(res, { data: addresses });
});