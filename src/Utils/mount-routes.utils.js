import * as router from '../Modules/index.js'

/**
 * Mounts the route handlers to the Express application.
 *
 * @param {import('express').Express} app - The Express application instance.
 */
export const bootstrap = (app) => {
  app.get('/', home)
  app.use('/api/v1/users', router.userRouter)
  app.use('/api/v1/categories', router.categoryRouter)
  app.use('/api/v1/sub-categories', router.subcategoryRouter)
  app.use('/api/v1/brands', router.brandRouter)
  app.use('/api/v1/products', router.productRouter)
  app.use('/api/v1/addresses', router.addressRouter)
  app.use('/api/v1/carts', router.cartRouter)
  app.use('/api/v1/coupons', router.couponRouter)
  app.use('/api/v1/orders', router.orderRouter)
  app.use('/api/v1/reviews', router.reviewRouter)
}


const home = async (req, res, next) => {
  return res.send(` <h1 style="color: white; text-align: center; font-family: Arial, sans-serif; margin-top: 20%; background: linear-gradient(to right, #6a11cb, #2575fc); padding: 20px; border-radius: 10px;">
      🚀 Server is up and running! ==> Here we go! 🎉
    </h1>`);
}


