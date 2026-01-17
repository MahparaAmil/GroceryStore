module Api
  module V1
    class OrdersController < ApplicationController
      skip_before_action :verify_authenticity_token
      before_action :authenticate_user!, except: [:create]
      before_action :set_order, only: [:show, :update, :update_status, :destroy]

      # GET /api/v1/orders
      def index
        if current_user&.admin?
          @orders = Order.includes(:order_items, :user).all
        elsif current_user
          @orders = current_user.orders.includes(:order_items)
        else
          render json: { message: 'Unauthorized' }, status: :unauthorized
          return
        end
        
        render json: @orders.as_json(include: :order_items)
      end

      # GET /api/v1/orders/:id
      def show
        render json: @order.as_json(include: :order_items)
      end

      # POST /api/v1/orders
      def create
        @order = Order.new(order_params)
        @order.user = current_user if current_user

        if @order.save
          # Create order items
          if params[:items].present?
            params[:items].each do |item|
              @order.order_items.create!(
                product_id: item[:product_id],
                quantity: item[:quantity],
                price: item[:price]
              )
            end
          end
          
          render json: @order.as_json(include: :order_items), status: :created
        else
          render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/orders/:id/update_status
      def update_status
        unless current_user&.admin?
          render json: { message: 'Unauthorized' }, status: :forbidden
          return
        end

        if @order.update(status: params[:status])
          render json: @order
        else
          render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/orders/:id
      def destroy
        @order.destroy
        head :no_content
      end

      private

      def set_order
        @order = Order.find(params[:id])
      end

      def order_params
        params.require(:order).permit(:user_id, :total, :status, :delivery_address, :delivery_fee)
      end

      def authenticate_user!
        token = request.headers['Authorization']&.split(' ')&.last
        return unless token

        begin
          decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
          @current_user = User.find(decoded['user_id'])
        rescue JWT::DecodeError, ActiveRecord::RecordNotFound
          nil
        end
      end

      def current_user
        @current_user
      end
    end
  end
end
