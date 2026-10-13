"""
app/main.py - ScrapSetu FastAPI application entrypoint.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import config
from app.api import api_router
from app.storage.storage_factory import initialize_all_csv_files, get_repo

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("scrapsetuu")


def _seed_initial_data() -> None:
    """Seed initial material categories and service areas if tables are empty."""
    cat_repo = get_repo("material_categories")
    if cat_repo.count() == 0:
        logger.info("Seeding initial material categories...")
        categories = [
            {
                "id": "cat_electronics",
                "name": "Consumer Electronics",
                "name_hi": "उपभोक्ता इलेक्ट्रॉनिक्स",
                "parent_id": "",
                "subcategories": "Smartphones, Laptops, Tablets, Computers, Monitors, Printers, TVs",
                "is_active": "true",
                "sort_order": "1",
            },
            {
                "id": "cat_batteries",
                "name": "Batteries",
                "name_hi": "बैटरियां",
                "parent_id": "",
                "subcategories": "Lithium-ion, Lead-acid, NiMH, AA/AAA",
                "is_active": "true",
                "sort_order": "2",
            },
            {
                "id": "cat_appliances",
                "name": "Home Appliances",
                "name_hi": "घरेलू उपकरण",
                "parent_id": "",
                "subcategories": "AC, Refrigerator, Washing Machine, Microwave",
                "is_active": "true",
                "sort_order": "3",
            },
            {
                "id": "cat_cables",
                "name": "Cables & Wiring",
                "name_hi": "केबल और तार",
                "parent_id": "",
                "subcategories": "Copper Cables, Aluminum Wires, Power Cords",
                "is_active": "true",
                "sort_order": "4",
            },
            {
                "id": "cat_pcb",
                "name": "PCBs & Components",
                "name_hi": "सर्किट बोर्ड और घटक",
                "parent_id": "",
                "subcategories": "Motherboards, RAM Modules, Power Supplies",
                "is_active": "true",
                "sort_order": "5",
            },
            {
                "id": "cat_other",
                "name": "Other E-Waste",
                "name_hi": "अन्य ई-कचरा",
                "parent_id": "",
                "subcategories": "Keyboards, Mice, Electronic Toys",
                "is_active": "true",
                "sort_order": "6",
            },
        ]
        for cat in categories:
            cat_repo.insert(cat)

    area_repo = get_repo("service_areas")
    if area_repo.count() == 0:
        logger.info("Seeding initial service areas...")
        cities = [
            ("Mumbai", "Maharashtra", "400001-400099"),
            ("Delhi", "Delhi", "110001-110099"),
            ("Bangalore", "Karnataka", "560001-560099"),
            ("Hyderabad", "Telangana", "500001-500099"),
            ("Chennai", "Tamil Nadu", "600001-600099"),
            ("Pune", "Maharashtra", "411001-411099"),
            ("Kolkata", "West Bengal", "700001-700099"),
            ("Ahmedabad", "Gujarat", "380001-380099"),
            ("Jaipur", "Rajasthan", "302001-302099"),
            ("Lucknow", "Uttar Pradesh", "226001-226099"),
            ("Surat", "Gujarat", "395001-395099"),
            ("Bhopal", "Madhya Pradesh", "462001-462099"),
        ]
        for city, state, pins in cities:
            area_repo.insert({
                "city": city,
                "state": state,
                "pincode_ranges": pins,
                "is_active": "true",
            })


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting ScrapSetu backend (%s environment)...", config.APP_ENV)
    config.ensure_dirs()
    initialize_all_csv_files()
    _seed_initial_data()
    yield
    logger.info("Shutting down ScrapSetu backend...")


app = FastAPI(
    title="ScrapSetu API",
    version=config.APP_VERSION,
    description="Vernacular e-waste and recyclable material marketplace backend.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
origins = config.CORS_ORIGINS if config.CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe error handlers (never expose stack traces)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error processing %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Mount API routers
app.include_router(api_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": "ScrapSetu API",
        "version": config.APP_VERSION,
        "status": "operational",
        "storage": config.STORAGE_BACKEND,
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "storage": "csv_ready"}

