class Twittercall < ActiveRecord::Base

	def self.gettweets(client,lat,long,radius)
		client.search("", :result_type => "recent",:count=>3, :geocode => lat.to_s+","+long.to_s+","+radius.to_s+"km").collect do |tweet|
 "#{tweet.user.screen_name}: #{tweet.text}"
  	end
	end
end
