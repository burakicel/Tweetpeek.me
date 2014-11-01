class PagesController < ApplicationController
  def home
  	client = Twitter::REST::Client.new do |config|
			config.consumer_key        = "mCVrogz8aHG0pVoAAEBIyvQct"
			config.consumer_secret     = "L8bjSDrAi7h20Ts6FnqVKDrFtrdnTb5hL0XdXglEOw3Lfvhs2N"
			config.access_token        = "457123115-m845XSLq87jxERfKB8JfCb75qSD2WcqzTVcfyoRy"
			config.access_token_secret = "9ev7lx00rwEITKT88WCPQrBKg5yytBmqzDb30QfPGMbDT"
	end
	@tweets = Twittercall.gettweets(client,41.3111,-72.9267,0.01)
  end
end
