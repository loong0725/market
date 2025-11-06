from rest_framework import serializers
from .models import User, is_ait_email

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'ait_email', 'is_verified', 'phone', 'bio', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login', 'username', 'email', 'ait_email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "password", "confirm_password", "email")

    def validate_email(self, value):
        if not is_ait_email(value):
            raise serializers.ValidationError("Email must end with @ait.ac.th")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop("password")
        # Set ait_email same as email
        validated_data['ait_email'] = validated_data['email']
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
