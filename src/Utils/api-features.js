export class ApiFeatures {
    /**
     * Constructor for the ApiFeatures class
     * @constructor
     * @param {Object} mongooseQuery - The mongoose query object
     * @param {Object} query - The query object from the request
     */
    constructor(mongooseQuery, query) {
        /**
         * The mongoose query object
         * @type {Object}
         */
        this.mongooseQuery = mongooseQuery;

        /**
         * The query object from the request
         * @type {Object}
         */
        this.query = query;
    }


    // can make calc countDouments and path as paramter to function .
    pagination(countDocuments) {
        let page = this.query.page * 1 || 1;
        if (this.query.page < 0) page = 1;

        let limit = this.query.limit * 1 || 25;
        if (this.query.limit > 50) limit = 50;

        const skip = (page - 1) * limit;
        const endPageIndex = page * limit;

        //pagination Result
        const pagination = {};
        pagination.currentPage = page;
        pagination.limit = limit;
        pagination.totalDocs = countDocuments;
        pagination.numberofPages = Math.ceil(countDocuments / limit); // number pages = all document in DB / limit   50/10=5

        // next page 
        if (endPageIndex < countDocuments) {
            pagination.next = page + 1;
        }

        // prev page
        if (skip > 0) {
            pagination.prev = page - 1;
        }

        this.mongooseQuery.skip(skip).limit(limit);
        this.paginationResult = pagination;

        return this;
    }

    filter() {
        let filterObj = structuredClone(this.query); // deep copy

        let excludeFields = ['page', 'limit', 'fields', 'sort'];
        excludeFields.forEach(val => delete filterObj[val]);

        filterObj = JSON.stringify(filterObj);
        filterObj = filterObj.replaceAll(/lt|lte|gt|gte|eq|ne|regex/g, (ele) => `$${ele}`);
        filterObj = JSON.parse(filterObj);

        this.mongooseQuery.find(filterObj);

        return this;
    }

    sort() {
        if (this.query.sort) {
            let sortBy = this.query.sort.split(',').join(' '); // ex: price,-sold =>[price,-sold]=> price -sold
            this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery = this.mongooseQuery.sort('-createdAt')
        }
        return this;
    }

    fields() {
        if (this.query.fields) {
            let fields = this.query.fields.split(',').join(' ');
            this.mongooseQuery.select(fields);
        }
        return this;
    }

    search(modelName) {
        if (this.query.search) {
            const keyword = this.query.search
            // let query = {};

            const query = {
                $or: [
                    { title: { $regex: keyword, $options: 'i' } },
                    { overview: { $regex: keyword, $options: 'i' } }
                ]
            };

            // Log the search query for debugging
            console.log("Search query:", keyword);
            console.log("Constructed query:", JSON.stringify(query, null, 2));

            this.mongooseQuery.find(query);
            
            // this.mongooseQuery.find({
            //     $or: [
            //         { title: { $regex: keyword, $options: 'i' } },
            //         { overview: { $regex: keyword, $options: 'i' } }
            //     ]
            // });
        }

        return this;
    }

} 