from fastapi import APIRouter

from src.routes.appointments_routes import appointments_router
from src.routes.clients_routes import clients_router
from src.routes.health_routes import health_router
from src.routes.industry_routes import industry_router
from src.routes.looks_morgue_routes import looks_morgue_router
from src.routes.look_products_routes import look_products_router
from src.routes.uploads_routes import uploads_router
from src.routes.allergies_routes import router as allergies_router
from src.routes.foundation_shades_routes import router as foundation_shades_router
from src.routes.appointment_products_routes import router as appointment_products_router
from src.routes.before_after_photos_routes import before_after_photos_router
from src.routes.client_history_routes import router as client_history_router
from src.routes.eyeshadow_preferences_routes import router as eyeshadow_preferences_router
from src.routes.lip_preferences_routes import lip_preferences_router
from src.routes.makeup_looks_routes import makeup_looks_router
from src.routes.products_routes import products_router
from src.routes.users_routes import router as users_router


api_router = APIRouter()
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(clients_router, prefix="/clients", tags=["clients"])
api_router.include_router(allergies_router, prefix="/allergies", tags=["allergies"])
api_router.include_router(foundation_shades_router, prefix="/foundation-shades", tags=["foundation-shades"])
api_router.include_router(appointment_products_router, prefix="/appointment-products", tags=["appointment-products"])
api_router.include_router(before_after_photos_router, prefix="/before-after-photos", tags=["before-after-photos"])
api_router.include_router(client_history_router, prefix="/client-history", tags=["client-history"])
api_router.include_router(eyeshadow_preferences_router, prefix="/eyeshadow-preferences", tags=["eyeshadow-preferences"])
api_router.include_router(lip_preferences_router, prefix="/lip-preferences", tags=["lip-preferences"])
api_router.include_router(look_products_router, prefix="/look-products", tags=["look-products"])
api_router.include_router(makeup_looks_router, prefix="/makeup-looks", tags=["makeup-looks"])
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(appointments_router, prefix="/appointments", tags=["appointments"])
api_router.include_router(industry_router, prefix="/industry", tags=["industry"])
api_router.include_router(uploads_router, prefix="/uploads", tags=["uploads"])
api_router.include_router(looks_morgue_router, prefix="/looks-morgue", tags=["looks-morgue"])
