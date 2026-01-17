class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :orders

  enum role: { customer: 0, admin: 1, guest: 2 }

  # Ransack configuration for ActiveAdmin search
  def self.ransackable_attributes(auth_object = nil)
    ["created_at", "email", "id", "role", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["orders"]
  end
end
