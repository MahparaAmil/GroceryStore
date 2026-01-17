module Api
  module V1
    class ProductsController < ApplicationController
      skip_before_action :verify_authenticity_token
      before_action :set_product, only: [:show, :update, :destroy]

      # GET /api/v1/products
      def index
        @products = Product.includes(:category, :brand).all
        render json: @products.as_json(include: { 
          category: { only: [:id, :name, :image_url] }, 
          brand: { only: [:id, :name, :image_url] } 
        })
      end

      # GET /api/v1/products/:id
      def show
        render json: @product.as_json(include: { 
          category: { only: [:id, :name, :image_url] }, 
          brand: { only: [:id, :name, :image_url] } 
        })
      end

      # POST /api/v1/products
      def create
        @product = Product.new(product_params)

        if @product.save
          render json: @product, status: :created
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/products/:id
      def update
        if @product.update(product_params)
          render json: @product
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/products/:id
      def destroy
        @product.destroy
        head :no_content
      end

      private

      def set_product
        @product = Product.find(params[:id])
      end

      def product_params
        params.require(:product).permit(:name, :price, :stock, :description, :image_url, :category, :brand, :barcode, :nutrition)
      end
    end
  end
end
