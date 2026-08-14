import json
import os
import re
import html

SITE_NAME = "Eng. Mostafa Khalid Sallam | MKS.Tech"
FALLBACK_ARTICLE_IMAGE = "https://i.postimg.cc/bJjPN3Y3/IMG_20251124_054956_985.png"
FALLBACK_TEACHING_IMAGE = "https://i.postimg.cc/8z5PqKsM/Picsart_26_01_14_23_40_58_850.png"

def clean_text(text):
    if not text:
        return ""
    # Strip HTML tags
    clean = re.sub(r'<[^>]+>', ' ', text)
    # Strip excessive whitespaces
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def generate_articles_summary():
    print("Generating articles-summary.json...")
    with open('articles.json', 'r', encoding='utf-8') as f:
        articles = json.load(f)

    summary_list = []
    for art in articles:
        summary_list.append({
            "id": art.get("id"),
            "category": art.get("category", "other"),
            "image": art.get("image", "#"),
            "link": art.get("link", "#"),
            "date": art.get("date", ""),
            "tags": art.get("tags", []),
            "title": art.get("title", {"ar": "", "en": ""}),
            "summary": art.get("summary", {"ar": "", "en": ""})
        })

    with open('articles-summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary_list, f, ensure_ascii=False, indent=2)
    
    orig_size = os.path.getsize('articles.json') / (1024 * 1024)
    new_size = os.path.getsize('articles-summary.json') / 1024
    print(f"articles-summary.json generated! Size reduced from {orig_size:.2f} MB to {new_size:.1f} KB ({(1 - (new_size/1024)/orig_size)*100:.1f}% reduction).")
    return articles

def generate_article_share_pages(articles):
    print(f"Generating static share pages for {len(articles)} articles...")
    os.makedirs('articles', exist_ok=True)

    for art in articles:
        art_id = art.get('id')
        title_ar = art.get('title', {}).get('ar', '')
        title_en = art.get('title', {}).get('en', '')
        summary_ar = clean_text(art.get('summary', {}).get('ar', ''))
        summary_en = clean_text(art.get('summary', {}).get('en', ''))
        
        main_title = title_ar if title_ar else title_en
        main_summary = summary_ar if summary_ar else summary_en
        
        img = art.get('image', '')
        if not img or img == '#' or not img.startswith('http'):
            img = FALLBACK_ARTICLE_IMAGE
            
        date = art.get('date', '')
        tags = art.get('tags', [])
        tags_str = ', '.join(tags)

        # HTML template for article preview - Luxury Theme
        html_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(main_title)} | MKS.Tech</title>
    
    <!-- Primary Meta Tags -->
    <meta name="title" content="{html.escape(main_title)}">
    <meta name="description" content="{html.escape(main_summary)}">
    <meta name="keywords" content="{html.escape(tags_str)}">
    <meta name="author" content="Eng. Mostafa Khalid Sallam">
    <meta name="theme-color" content="#d4af37">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://mostafa-khalid208.github.io/Test/articles/?id={art_id}">
    <meta property="og:title" content="{html.escape(main_title)}">
    <meta property="og:description" content="{html.escape(main_summary)}">
    <meta property="og:image" content="{html.escape(img)}">
    <meta property="og:image:secure_url" content="{html.escape(img)}">
    <meta property="og:image:alt" content="{html.escape(main_title)}">
    <meta property="og:site_name" content="{SITE_NAME}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://mostafa-khalid208.github.io/Test/articles/?id={art_id}">
    <meta name="twitter:title" content="{html.escape(main_title)}">
    <meta name="twitter:description" content="{html.escape(main_summary)}">
    <meta name="twitter:image" content="{html.escape(img)}">
    
    <!-- Schema.org Article JSON-LD -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": {json.dumps(main_title, ensure_ascii=False)},
      "image": [{json.dumps(img)}],
      "datePublished": {json.dumps(date)},
      "author": {{
        "@type": "Person",
        "name": "Eng. Mostafa Khalid Sallam"
      }},
      "description": {json.dumps(main_summary, ensure_ascii=False)}
    }}
    </script>
    
    <!-- Instant Redirect to Article Reader -->
    <meta http-equiv="refresh" content="0; url=../articles/?id={art_id}">
    <script>
        window.location.replace("../articles/?id={art_id}");
    </script>
    
    <style>
        body {{
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background: #080b11;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
        }}
        .card {{
            background: rgba(15, 21, 35, 0.85);
            border: 1px solid rgba(212, 175, 55, 0.35);
            border-radius: 20px;
            padding: 35px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.12);
        }}
        img {{
            max-width: 100%;
            max-height: 250px;
            border-radius: 14px;
            object-fit: cover;
            margin-bottom: 20px;
            border: 1px solid rgba(212, 175, 55, 0.2);
        }}
        h1 {{
            font-size: 1.4rem;
            color: #d4af37;
            margin-bottom: 12px;
            line-height: 1.5;
        }}
        p {{
            font-size: 0.95rem;
            color: #94a3b8;
            line-height: 1.7;
        }}
        a.btn {{
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
            color: #000;
            font-weight: bold;
            text-decoration: none;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }}
    </style>
</head>
<body>
    <div class="card">
        <img src="{html.escape(img)}" alt="{html.escape(main_title)}">
        <h1>{html.escape(main_title)}</h1>
        <p>{html.escape(main_summary)}</p>
        <a href="../articles/?id={art_id}" class="btn">قراءة المقال / Read Article</a>
    </div>
</body>
</html>"""
        
        file_path = os.path.join('articles', f'article-{art_id}.html')
        with open(file_path, 'w', encoding='utf-8') as out_f:
            out_f.write(html_content)

    print("Article share pages successfully generated!")

def generate_teachings_share_pages():
    with open('teachings.json', 'r', encoding='utf-8') as f:
        teachings = json.load(f)

    print(f"Generating static share pages for {len(teachings)} teachings & coupons...")
    os.makedirs('teaching-details', exist_ok=True)

    for item in teachings:
        item_id = item.get('id')
        item_type = item.get('type', 'course')
        title_ar = item.get('title', {}).get('ar', '')
        title_en = item.get('title', {}).get('en', '')
        summary_ar = clean_text(item.get('summary', {}).get('ar', ''))
        summary_en = clean_text(item.get('summary', {}).get('en', ''))
        coupon_code = item.get('couponCode', '')
        
        main_title = title_ar if title_ar else title_en
        main_summary = summary_ar if summary_ar else summary_en
        
        if item_type == 'coupon' and coupon_code:
            main_title = f"🎟️ كود خصم: {coupon_code} - {main_title}"
            main_summary = f"كود الكوبون: {coupon_code} | {main_summary}"

        img = item.get('image', '')
        if not img or img == '#' or not img.startswith('http'):
            img = FALLBACK_TEACHING_IMAGE

        # HTML template for teaching preview - Luxury Theme
        html_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(main_title)} | MKS.Tech</title>
    
    <!-- Primary Meta Tags -->
    <meta name="title" content="{html.escape(main_title)}">
    <meta name="description" content="{html.escape(main_summary)}">
    <meta name="author" content="Eng. Mostafa Khalid Sallam">
    <meta name="theme-color" content="#d4af37">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://mostafa-khalid208.github.io/Test/teaching-details/?id={item_id}">
    <meta property="og:title" content="{html.escape(main_title)}">
    <meta property="og:description" content="{html.escape(main_summary)}">
    <meta property="og:image" content="{html.escape(img)}">
    <meta property="og:image:secure_url" content="{html.escape(img)}">
    <meta property="og:site_name" content="{SITE_NAME}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://mostafa-khalid208.github.io/Test/teaching-details/?id={item_id}">
    <meta name="twitter:title" content="{html.escape(main_title)}">
    <meta name="twitter:description" content="{html.escape(main_summary)}">
    <meta name="twitter:image" content="{html.escape(img)}">
    
    <!-- Instant Redirect to Teaching Details -->
    <meta http-equiv="refresh" content="0; url=../teaching-details/?id={item_id}">
    <script>
        window.location.replace("../teaching-details/?id={item_id}");
    </script>
    
    <style>
        body {{
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background: #080b11;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
        }}
        .card {{
            background: rgba(15, 21, 35, 0.85);
            border: 1px solid rgba(212, 175, 55, 0.35);
            border-radius: 20px;
            padding: 35px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.12);
        }}
        img {{
            max-width: 100%;
            max-height: 250px;
            border-radius: 14px;
            object-fit: cover;
            margin-bottom: 20px;
            border: 1px solid rgba(212, 175, 55, 0.2);
        }}
        h1 {{
            font-size: 1.4rem;
            color: #d4af37;
            margin-bottom: 12px;
            line-height: 1.5;
        }}
        p {{
            font-size: 0.95rem;
            color: #94a3b8;
            line-height: 1.7;
        }}
        .coupon-box {{
            background: rgba(6, 95, 70, 0.3);
            border: 1px dashed #d4af37;
            color: #fef08a;
            font-size: 1.3rem;
            font-weight: bold;
            padding: 12px;
            border-radius: 10px;
            margin: 15px 0;
            letter-spacing: 2px;
        }}
        a.btn {{
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
            color: #000;
            font-weight: bold;
            text-decoration: none;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }}
    </style>
</head>
<body>
    <div class="card">
        <img src="{html.escape(img)}" alt="{html.escape(main_title)}">
        <h1>{html.escape(main_title)}</h1>
        {f'<div class="coupon-box">{coupon_code}</div>' if coupon_code else ''}
        <p>{html.escape(main_summary)}</p>
        <a href="../teaching-details/?id={item_id}" class="btn">التفاصيل والتسجيل / View Details</a>
    </div>
</body>
</html>"""
        
        file_path = os.path.join('teaching-details', f'teaching-{item_id}.html')
        with open(file_path, 'w', encoding='utf-8') as out_f:
            out_f.write(html_content)

    print("Teachings & Coupons share pages successfully generated!")

def main():
    articles = generate_articles_summary()
    generate_article_share_pages(articles)
    generate_teachings_share_pages()
    print("\nAll share pages and summaries successfully generated!")

if __name__ == '__main__':
    main()
