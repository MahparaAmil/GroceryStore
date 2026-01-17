module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :verify_authenticity_token
      
      def login
        user = User.find_by(email: params[:email])
        
        if user&.valid_password?(params[:password])
          token = encode_token(user_id: user.id)
          render json: {
            message: 'Login successful',
            token: token,
            user: { id: user.id, email: user.email, role: user.role }
          }, status: :ok
        else
          render json: { message: 'Invalid credentials' }, status: :unauthorized
        end
      end

      def signup
        user = User.new(email: params[:email], password: params[:password], role: :customer)
        
        if user.save
          token = encode_token(user_id: user.id)
          render json: {
            message: 'User created successfully',
            token: token,
            user: { id: user.id, email: user.email, role: user.role }
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def me
        if current_user
          render json: {
            id: current_user.id,
            email: current_user.email,
            role: current_user.role
          }, status: :ok
        else
          render json: { message: 'Unauthorized' }, status: :unauthorized
        end
      end

      def check_email
        user = User.find_by(email: params[:email])
        if user
          render json: {
            exists: true,
            isGuest: user.guest?,
            role: user.role
          }
        else
          render json: {
            exists: false,
            isGuest: false
          }
        end
      end

      private

      def encode_token(payload)
        JWT.encode(payload, Rails.application.credentials.secret_key_base)
      end
    end
  end
end
