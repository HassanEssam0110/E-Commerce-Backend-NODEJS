import slugify from 'slugify';

/**
 * This function generates a slug from a given value.
 * @param {string} val - The value to generate the slug from.
 * @returns {string} - The generated slug.
 */
const generateSlug = (val) => {
    const slugValue = slugify(val, {
        replacement: "_",
        lower: true,
    });

    return slugValue;
}

export {
    generateSlug
}
