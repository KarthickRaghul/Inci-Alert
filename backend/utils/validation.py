from marshmallow import Schema, fields, validate, ValidationError
from typing import Dict, Any
import re

class IncidentCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=512))
    description = fields.Str(required=True, validate=validate.Length(min=1))
    category = fields.Str(required=True, validate=validate.OneOf([
        'fire', 'accident', 'medical', 'crime', 'weather', 'natural_disaster',
        'infrastructure', 'security', 'hazmat', 'other'
    ]))
    location = fields.Str(required=True, validate=validate.Length(min=1, max=256))
    latitude = fields.Float(validate=validate.Range(min=-90, max=90))
    longitude = fields.Float(validate=validate.Range(min=-180, max=180))
    status = fields.Str(validate=validate.OneOf(['reported', 'confirmed', 'resolved', 'closed']), 
                       missing='reported')
    source = fields.Str(validate=validate.Length(max=32), missing='user')

class IncidentUpdateSchema(Schema):
    title = fields.Str(validate=validate.Length(min=1, max=512))
    description = fields.Str(validate=validate.Length(min=1))
    category = fields.Str(validate=validate.OneOf([
        'fire', 'accident', 'medical', 'crime', 'weather', 'natural_disaster',
        'infrastructure', 'security', 'hazmat', 'other'
    ]))
    location = fields.Str(validate=validate.Length(min=1, max=256))
    latitude = fields.Float(validate=validate.Range(min=-90, max=90))
    longitude = fields.Float(validate=validate.Range(min=-180, max=180))
    status = fields.Str(validate=validate.OneOf(['reported', 'confirmed', 'resolved', 'closed']))

class UserRegistrationSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    first_name = fields.Str(validate=validate.Length(max=50))
    last_name = fields.Str(validate=validate.Length(max=50))
    phone = fields.Str(validate=validate.Length(max=20))

class UserLoginSchema(Schema):
    username = fields.Str(required=True)  # Can be username or email
    password = fields.Str(required=True)

def validate_request_data(schema_class: Schema, data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate request data against a marshmallow schema."""
    schema = schema_class()
    try:
        return schema.load(data)
    except ValidationError as err:
        raise ValidationError(err.messages)
