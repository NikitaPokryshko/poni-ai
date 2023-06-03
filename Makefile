build:
	docker build -t voice-ai-telebot .
run:
	docker run -d -p 3000:3000 --name voice-ai-telebot --rm voice-ai-telebot