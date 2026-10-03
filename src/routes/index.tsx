import { SITE_URL } from "@/lib/site-url";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock,
  HeartHandshake,
  MapPin,
  Phone,
  Quote,
} from "lucide-react";
import { Reveal } from "@/components/site/Section";
import { MediaCarousel, MediaCarouselCard } from "@/components/site/MediaCarousel";
import { AudioPlayer } from "@/components/site/AudioPlayer";
import { ShareMenu } from "@/components/site/ShareMenu";
import { ChurchLogo, SiteContainer } from "@/components/site/SitePrimitives";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeDataState, HomeHeading, HomePhoto } from "@/components/home/HomeElements";
import {
  useSermons,
  useGalleryPhotos,
  useTestimonies,
  usePastor,
  useEvents,
} from "@/lib/supabase-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Risen Power Gospel Ministries | A House of Power & Presence" },
      {
        name: "description",
        content:
          "Risen Power Gospel Ministries in Warri, Delta State. Plan your visit, explore sermons, share in worship and find a welcoming church family.",
      },
      {
        property: "og:title",
        content: "Risen Power Gospel Ministries | A House of Power & Presence",
      },
      {
        property: "og:description",
        content:
          "Where faith is ignited, lives are transformed, and God's power is revealed. Join us for worship in Warri, Delta State.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: Index,
});

// Existing ministry statements and service times, preserved from the About page.
const services = [
  { day: "Sunday", time: "8:00 AM", title: "Divine Service" },
  { day: "Wednesday", time: "5:00 PM", title: "Bible Study" },
  { day: "Friday", time: "5:00 PM", title: "Revival Service" },
  { day: "1st & 3rd Saturday", time: "8:00 AM", title: "Morning Prayer" },
];
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Lagos",
});
const eventTime = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Lagos",
});
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date to be confirmed" : dateFormat.format(date);
}

function Index() {
  const sermons = useSermons();
  const photos = useGalleryPhotos();
  const testimonies = useTestimonies();
  const events = useEvents();
  const pastor = usePastor();
  const latestSermons = sermons.data.slice(0, 3);
  const latestPhotos = photos.data.slice(0, 5);
  const approved = testimonies.data.filter((testimony) => testimony.is_approved).slice(0, 5);
  const upcoming = events.data
    .filter((event) => !event.is_archived && new Date(event.starts_at).getTime() >= Date.now())
    .slice(0, 3);

  return (
    <div className="rpgm-home">
      <HomeHero />
      <section className="home-service-ribbon" aria-label="Sunday worship and location">
        <SiteContainer className="home-service-ribbon-inner">
          <div>
            <Clock size={21} aria-hidden="true" />
            <p>
              <span>Gather with us this Sunday</span>
              <strong>
                8:00 AM <span aria-hidden="true">/</span> Divine Service
              </strong>
            </p>
          </div>
          <div>
            <MapPin size={21} aria-hidden="true" />
            <p>
              <span>A church family in Delta State</span>
              <strong>Effurun GRA, Warri</strong>
            </p>
          </div>
          <Link to="/live" className="home-text-link">
            Join us online <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </SiteContainer>
      </section>

      <section id="welcome" className="home-section home-welcome" aria-labelledby="welcome-heading">
        <SiteContainer className="home-welcome-grid">
          <Reveal y={18}>
            <p className="home-eyebrow">You are welcome here</p>
            <h2 id="welcome-heading">
              Come as you are.
              <br />
              <em>Grow in faith.</em>
            </h2>
            <p className="home-lead">
              A community of worshippers, rooted in the Word and united by the love of Jesus.
            </p>
            <p className="home-body">
              Risen Power Gospel Ministries is a community of worshippers contending for the
              manifest presence of God in our generation. Established in the heart of Delta State,
              we are committed to the uncompromised gospel of Jesus Christ.
            </p>
            {pastor?.short_message && (
              <blockquote className="home-pastor-message">
                &ldquo;{pastor.short_message}&rdquo;
              </blockquote>
            )}
            {pastor?.name && (
              <p className="home-pastor-name">
                {pastor.name}
                {pastor.title && <span>{pastor.title}</span>}
              </p>
            )}
            {pastor?.bio && <p className="home-body home-pastor-bio">{pastor.bio}</p>}
            <Link to="/about" className="home-text-link">
              Discover our church <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal y={22} delay={0.1}>
            <figure className="home-welcome-portrait">
              <div className="home-portrait-media">
                {pastor?.photo_url ? (
                  <HomePhoto
                    src={pastor.photo_url}
                    alt={pastor.name || "Our pastor"}
                    className="home-pastor-photo"
                  />
                ) : (
                  <div className="home-brand-portrait">
                    <ChurchLogo />
                    <span>
                      Rooted in the Word.
                      <br />
                      Alive in His power.
                    </span>
                  </div>
                )}
              </div>
              <figcaption>
                <span className="home-eyebrow">
                  {pastor?.name ? "A word from our pastor" : "Faith. Fellowship. Family."}
                </span>
                <span>{pastor?.name || "Risen Power Gospel Ministries"}</span>
              </figcaption>
              <span className="home-portrait-outline" aria-hidden="true" />
            </figure>
          </Reveal>
        </SiteContainer>
      </section>

      <section className="home-purpose" aria-label="Our mission and vision">
        <SiteContainer className="home-purpose-grid">
          <Reveal y={16}>
            <article>
              <span className="home-purpose-number" aria-hidden="true">
                01
              </span>
              <p className="home-eyebrow">Our mission</p>
              <h2>
                Faith that reaches
                <br />
                beyond our walls.
              </h2>
              <p>
                To win souls, disciple believers, and demonstrate the kingdom of God through
                worship, the Word, and signs following.
              </p>
            </article>
          </Reveal>
          <Reveal y={16} delay={0.1}>
            <article>
              <span className="home-purpose-number" aria-hidden="true">
                02
              </span>
              <p className="home-eyebrow">Our vision</p>
              <h2>
                A generation alive
                <br />
                in His power.
              </h2>
              <p>
                To raise a generation of Spirit-filled believers who carry the resurrection power of
                Jesus into every sphere of life.
              </p>
            </article>
          </Reveal>
        </SiteContainer>
      </section>

      <section
        id="plan-your-visit"
        className="home-section home-visit"
        aria-labelledby="visit-heading"
      >
        <SiteContainer>
          <div className="home-visit-heading">
            <Reveal y={16}>
              <p className="home-eyebrow">Make yourself at home</p>
              <h2 id="visit-heading">Your Sunday starts here.</h2>
              <p className="home-section-intro">
                Join us for worship, the Word and a welcoming community. We would love to meet you.
              </p>
            </Reveal>
            <Link to="/contact" className="home-button home-button--blue">
              Plan your first visit <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-services">
            {services.map((service, index) => (
              <Reveal key={service.day} delay={index * 0.05} y={14}>
                <article className="home-service-card">
                  <Clock size={21} aria-hidden="true" />
                  <p className="home-service-day">{service.day}</p>
                  <h3>{service.time}</h3>
                  <p>{service.title}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="home-visit-address">
            <a
              href="https://maps.app.goo.gl/PtuwLzYDwzKFwocJ9?g_st=ac"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={19} aria-hidden="true" />
              <span>
                VITAFOAM Comfort Center, DSC Expressway, Effurun GRA, Warri 330102, Delta State,
                Nigeria
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a href="tel:09072523125">
              <Phone size={18} aria-hidden="true" />
              09072523125
            </a>
          </div>
        </SiteContainer>
      </section>

      <section className="home-section home-sermons" aria-label="Latest sermons">
        <SiteContainer>
          <HomeHeading
            label="Be encouraged. Be equipped."
            title={
              <>
                The Word for <em>your week.</em>
              </>
            }
            to="/sermons"
            linkText="All sermons"
          >
            Listen again, reflect and carry the message into your everyday life.
          </HomeHeading>
          <HomeDataState
            loading={sermons.loading}
            error={sermons.error}
            empty={!latestSermons.length}
            noun="sermons"
          />
          {!sermons.loading && !sermons.error && latestSermons.length > 0 && (
            <MediaCarousel
              className="home-carousel"
              slideSizes={{ base: 100, sm: 75, md: 50, lg: 33.333 }}
            >
              {latestSermons.map((sermon) => (
                <MediaCarouselCard key={sermon.id}>
                  <article className="home-sermon-card">
                    <div className="home-sermon-art">
                      {sermon.cover_image ? (
                        <HomePhoto src={sermon.cover_image} alt={sermon.title} />
                      ) : (
                        <>
                          <BookOpen size={42} strokeWidth={1} aria-hidden="true" />
                          <span>The Word, alive &amp; active</span>
                        </>
                      )}
                      <span className="home-sermon-tag">{sermon.service_type}</span>
                    </div>
                    <div className="home-sermon-body">
                      <time dateTime={sermon.preached_on}>{formatDate(sermon.preached_on)}</time>
                      <h3>{sermon.title}</h3>
                      <p className="home-sermon-preacher">{sermon.preacher}</p>
                      {sermon.scripture && (
                        <p className="home-sermon-scripture">{sermon.scripture}</p>
                      )}
                      {sermon.description && <p className="home-body">{sermon.description}</p>}
                      {sermon.audio_url && (
                        <AudioPlayer
                          src={sermon.audio_url}
                          title={sermon.title}
                          downloadName={(sermon.audio_name || `${sermon.title}.mp3`).replace(
                            /[\\/:*?"<>|]/g,
                            "-",
                          )}
                          allowDownload={sermon.allow_download !== false}
                        />
                      )}
                      <div className="home-card-share">
                        <ShareMenu
                          url={`/sermons#${sermon.id}`}
                          title={sermon.title}
                          text={`${sermon.title} - ${sermon.preacher}`}
                        />
                      </div>
                    </div>
                  </article>
                </MediaCarouselCard>
              ))}
            </MediaCarousel>
          )}
        </SiteContainer>
      </section>

      <section className="home-scripture" aria-label="Scripture">
        <SiteContainer>
          <Reveal y={14}>
            <Quote size={26} aria-hidden="true" />
            <blockquote>
              &ldquo;I am the resurrection and the life. He who believes in Me, though he may die,
              he shall live.&rdquo;
            </blockquote>
            <p>John 11:25</p>
          </Reveal>
        </SiteContainer>
      </section>

      <section className="home-section home-events" aria-label="Upcoming events">
        <SiteContainer>
          <HomeHeading
            label="Life together"
            title={
              <>
                More than a Sunday.
                <br />
                <em>A community.</em>
              </>
            }
            to="/events"
            linkText="Explore events"
          >
            Gather with us for what is coming next.
          </HomeHeading>
          <HomeDataState
            loading={events.loading}
            error={events.error}
            empty={!upcoming.length}
            noun="upcoming events"
          />
          {!events.loading && !events.error && upcoming.length > 0 && (
            <div className="home-events-grid">
              {upcoming.map((event, index) => (
                <Reveal key={event.id} y={18} delay={index * 0.06}>
                  <article className="home-event-card">
                    {event.cover_image && (
                      <HomePhoto
                        src={event.cover_image}
                        alt={event.title}
                        className="home-event-photo"
                      />
                    )}
                    <div className="home-event-content">
                      <p className="home-event-date">
                        <CalendarDays size={18} aria-hidden="true" />
                        <time dateTime={event.starts_at}>{formatDate(event.starts_at)}</time>
                      </p>
                      <h3>{event.title}</h3>
                      <p className="home-body">{event.description}</p>
                      <p className="home-event-meta">
                        <Clock size={15} aria-hidden="true" />
                        {eventTime.format(new Date(event.starts_at))} WAT
                      </p>
                      {event.location && (
                        <p className="home-event-meta">
                          <MapPin size={15} aria-hidden="true" />
                          {event.location}
                        </p>
                      )}
                      <div className="home-card-share">
                        <ShareMenu
                          url={`/events#${event.id}`}
                          title={event.title}
                          text={`${event.title} - ${formatDate(event.starts_at)}`}
                        />
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </SiteContainer>
      </section>

      <section className="home-section home-gallery" aria-label="Church gallery">
        <SiteContainer>
          <HomeHeading
            label="Moments of faith & fellowship"
            title={
              <>
                There is joy <em>in His presence.</em>
              </>
            }
            to="/gallery"
            linkText="Visit the gallery"
          >
            Worship, connection and memories from our church family.
          </HomeHeading>
          <HomeDataState
            loading={photos.loading}
            error={photos.error}
            empty={!latestPhotos.length}
            noun="gallery photographs"
          />
          {!photos.loading && !photos.error && latestPhotos.length > 0 && (
            <MediaCarousel
              className="home-carousel"
              slideSizes={{ base: 88, sm: 60, md: 42, lg: 32 }}
            >
              {latestPhotos.map((photo) => (
                <MediaCarouselCard key={photo.id}>
                  <Link to="/gallery" className="home-gallery-card">
                    <HomePhoto
                      src={photo.image_url}
                      alt={photo.caption || "Church gallery photograph"}
                    />
                    <div>
                      <span>{photo.category}</span>
                      <h3>{photo.caption || "View in the gallery"}</h3>
                      <ArrowUpRight size={21} aria-hidden="true" />
                    </div>
                  </Link>
                </MediaCarouselCard>
              ))}
            </MediaCarousel>
          )}
        </SiteContainer>
      </section>

      <section className="home-section home-testimonies" aria-label="Approved testimonies">
        <SiteContainer>
          <HomeHeading
            label="Stories of His goodness"
            title={
              <>
                Real lives. <em>Renewed hope.</em>
              </>
            }
            to="/testimonies"
            linkText="Read & share testimonies"
          />
          <HomeDataState
            loading={testimonies.loading}
            error={testimonies.error}
            empty={!approved.length}
            noun="testimonies"
          />
          {!testimonies.loading && !testimonies.error && approved.length > 0 && (
            <MediaCarousel
              className="home-carousel"
              slideSizes={{ base: 100, sm: 80, md: 50, lg: 33.333 }}
            >
              {approved.map((testimony) => (
                <MediaCarouselCard key={testimony.id}>
                  <figure className="home-testimony-card">
                    <Quote size={30} strokeWidth={1.3} aria-hidden="true" />
                    <blockquote>{testimony.message}</blockquote>
                    <figcaption>
                      <span aria-hidden="true">{testimony.name[0]}</span>
                      {testimony.name}
                    </figcaption>
                  </figure>
                </MediaCarouselCard>
              ))}
            </MediaCarousel>
          )}
        </SiteContainer>
      </section>

      <section className="home-prayer" aria-labelledby="prayer-heading">
        <SiteContainer className="home-prayer-inner">
          <Reveal y={14}>
            <HeartHandshake size={30} strokeWidth={1.4} aria-hidden="true" />
            <p className="home-eyebrow">You do not have to walk alone</p>
            <h2 id="prayer-heading">
              Let us pray <em>with you.</em>
            </h2>
            <p>
              Share your prayer request with our ministry. We are here to stand with you in faith.
            </p>
          </Reveal>
          <Link to="/live" className="home-button home-button--white">
            Submit a prayer request <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </SiteContainer>
      </section>
    </div>
  );
}
