from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from slugify import slugify
from sqlalchemy import create_engine, Integer, String, Text, ForeignKey, select
from sqlalchemy.orm import DeclarativeBase
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
    Session
)


# ============================================================
# БАЗА ДАННЫХ
# ============================================================

DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    DATABASE_URL,
    echo=True,  # Изменил на True для отладки
    connect_args={"check_same_thread": False}  # Добавьте эту строку для SQLite
)


class Base(DeclarativeBase):
    pass


# ============================================================
# МОДЕЛИ SQLAlchemy
# ============================================================

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)

    posts: Mapped[List["Post"]] = relationship(back_populates="category")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(300), unique=True)
    content: Mapped[str] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(300))

    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"))
    category: Mapped["Category"] = relationship(back_populates="posts")


Base.metadata.create_all(engine)


# ============================================================
# Pydantic схемы
# ============================================================

## ----- CATEGORY -----
class CategoryCreate(BaseModel):
    name: str


class CategoryUpdate(BaseModel):
    name: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True  # Добавьте это для работы с ORM


## ----- POST -----
class PostCreate(BaseModel):
    name: str
    content: str
    image_url: Optional[str] = None
    category_id: int


class PostUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None


class PostOut(BaseModel):
    id: int
    name: str
    slug: str
    content: str
    image_url: Optional[str]
    category_id: int

    class Config:
        from_attributes = True  # Добавьте это для работы с ORM


# ============================================================
# FastAPI
# ============================================================

app = FastAPI(title="CRUD")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# CATEGORY CRUD
# ============================================================

@app.post("/categories", response_model=CategoryOut)
def create_category(data: CategoryCreate):
    with Session(engine) as session:
        category = Category(name=data.name)
        session.add(category)
        session.commit()
        session.refresh(category)
        return category


@app.get("/categories", response_model=List[CategoryOut])
def list_categories():
    with Session(engine) as session:
        categories = session.query(Category).all()
        return categories


@app.get("/categories/{category_id}", response_model=CategoryOut)
def get_category(category_id: int):
    with Session(engine) as session:
        category = session.get(Category, category_id)
        if not category:
            raise HTTPException(404, "Category not found")
        return category


@app.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, data: CategoryUpdate):
    with Session(engine) as session:
        category = session.get(Category, category_id)
        if not category:
            raise HTTPException(404, "Category not found")

        if data.name is not None:
            category.name = data.name

        session.commit()
        session.refresh(category)
        return category


@app.delete("/categories/{category_id}")
def delete_category(category_id: int):
    with Session(engine) as session:
        category = session.get(Category, category_id)
        if not category:
            raise HTTPException(404, "Category not found")

        session.delete(category)
        session.commit()
        return {"message": "Category deleted"}


# ============================================================
# POST CRUD
# ============================================================

@app.post("/posts", response_model=PostOut)
def create_post(data: PostCreate):
    with Session(engine) as session:
        # Проверяем категорию
        category = session.get(Category, data.category_id)
        if not category:
            raise HTTPException(400, "Category does not exist")

        slug = slugify(data.name)

        post = Post(
            name=data.name,
            slug=slug,
            content=data.content,
            image_url=data.image_url,
            category_id=data.category_id
        )
        session.add(post)
        session.commit()
        session.refresh(post)
        return post


@app.get("/posts", response_model=List[PostOut])
def list_posts(search: Optional[str] = Query(default=None)):
    with Session(engine) as session:
        stmt = select(Post)

        if search:
            stmt = stmt.where(Post.name.ilike(f"%{search}%"))

        posts = session.execute(stmt).scalars().all()
        return posts


@app.get("/posts/{slug}", response_model=PostOut)
def get_post(slug: str):
    with Session(engine) as session:
        post = session.query(Post).filter(Post.slug == slug).first()
        if not post:
            raise HTTPException(404, "Post not found")
        return post


@app.put("/posts/{slug}", response_model=PostOut)
def update_post(slug: str, data: PostUpdate):
    with Session(engine) as session:
        post = session.query(Post).filter(Post.slug == slug).first()
        if not post:
            raise HTTPException(404, "Post not found")

        if data.name is not None:
            post.name = data.name
            post.slug = slugify(data.name)

        if data.content is not None:
            post.content = data.content

        if data.image_url is not None:
            post.image_url = data.image_url

        if data.category_id is not None:
            category = session.get(Category, data.category_id)
            if not category:
                raise HTTPException(400, "Category does not exist")
            post.category_id = data.category_id

        session.commit()
        session.refresh(post)
        return post


@app.delete("/posts/{slug}")
def delete_post(slug: str):
    with Session(engine) as session:
        post = session.query(Post).filter(Post.slug == slug).first()
        if not post:
            raise HTTPException(404, "Post not found")

        session.delete(post)
        session.commit()
        return {"message": "Post deleted"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)