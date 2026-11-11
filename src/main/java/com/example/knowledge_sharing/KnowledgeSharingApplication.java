package com.example.knowledge_sharing;

import com.example.knowledge_sharing.builder.BirthdayBuilderInvitation;
import com.example.knowledge_sharing.builder.WeddingBuilderInvitation;
import com.example.knowledge_sharing.factory.abstraction.BirthdayFactory;
import com.example.knowledge_sharing.factory.abstraction.EventFactory;
import com.example.knowledge_sharing.factory.abstraction.WeddingFactory;
import com.example.knowledge_sharing.factory.method.BirthdayEvent;
import com.example.knowledge_sharing.factory.method.InvitationEvent;
import com.example.knowledge_sharing.factory.method.WeddingEvent;
import com.example.knowledge_sharing.factory.simple.BirthdayInvitation;
import com.example.knowledge_sharing.factory.simple.Invitation;
import com.example.knowledge_sharing.factory.simple.InvitationFactory;
import com.example.knowledge_sharing.prototype.InvitationCard;
import com.example.knowledge_sharing.singleton.Whiteboard;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Objects;

import static com.example.knowledge_sharing.factory.abstraction.EventFactory.prepareMatchingSet;

@SpringBootApplication
@Log4j2
public class KnowledgeSharingApplication {

	public static void main(String[] args) {

		log.info("\n");
		log.info("Singleton");

		// Singleton
		Whiteboard alice = Whiteboard.getInstance();
		Whiteboard bob = Whiteboard.getInstance();

		alice.write("Hello from Alice");

		log.info(bob.read());    // Hello from Alice
		log.info(Objects.equals(alice.read(), bob.read())); // true


		bob.write("Hello from BoB");

		log.info(alice.read());    // Hello from Alice
		log.info(Objects.equals(alice.read(), bob.read())); // true

		if (!"Hello from BoB".equals(bob.read())) {
			throw new AssertionError("Expected one shared whiteboard");
		}

		log.info("\n");
		log.info("Prototype");
		log.info("======================");

 		// Prototype
		InvitationCard template = new InvitationCard(
				"Guest",
				new StringBuilder("Wedding at 6 PM.")
		);

		InvitationCard shallow = template.shallowCopy();
		InvitationCard deep = template.deepCopy();

		shallow.setGuestName("Alice");
		deep.setGuestName("Bob");

		// Shared message changes in BOTH template and shallow copy
		shallow.getMessage().append(" Dinner included.");

		log.info("Template:  {} | {}" , template.getGuestName()  , template.getMessage());
		// Template: Guest | Wedding at 6 PM. Dinner included.

		log.info("Shallow: {} | {}" , shallow.getGuestName(), shallow.getMessage());
		// Shallow: Alice | Wedding at 6 PM. Dinner included.

		log.info("Deep: {} | {}" , deep.getGuestName(), deep.getMessage());
		// Deep: Bob | Wedding at 6 PM.

		assert template != shallow;               				// Separate cards
		assert template.getMessage() == shallow.getMessage(); 	// Shared message
		assert template.getMessage() != deep.getMessage();    	// Separate messages
		assert template.getGuestName().equals("Guest");
		assert deep.getMessage().toString().equals("Wedding at 6 PM.");


		log.info("\n");
		log.info("Simple Factory");
		log.info("======================");

		// 1. Simple Factory: pass a type.
		Invitation wedingInvitation = InvitationFactory.create("wedding");
		log.info("Simple Factory: {}", wedingInvitation.message());

		Invitation birthInvitation = InvitationFactory.create("birthday");
		log.info("Simple Factory: {}", birthInvitation.message());


		log.info("\n");
		log.info("Factory method");
		log.info("======================");
		// 2. Factory Method: choose a subclass.
		InvitationEvent.InvitingEvent event = new BirthdayEvent();
		log.info("Factory Method: {}" , event.prepareInvitation());

		InvitationEvent.InvitingEvent weddingEvent = new WeddingEvent();
		log.info("Factory Method: {}" , weddingEvent.prepareInvitation());


		SpringApplication.run(KnowledgeSharingApplication.class, args);



		log.info("\n");
		log.info("Abstract Factory");
		log.info("======================");


		// 3. Abstract Factory: choose a product family.
		EventFactory factory = new WeddingFactory();
		log.info("Abstract Factory: {}" , prepareMatchingSet(factory));

		// Runnable checks: enable with -ea.
//		Invitation invitation;
//        assert invitation instanceof WeddingInvitation;
		assert InvitationFactory.create("birthday") instanceof BirthdayInvitation;

		assert event.prepareInvitation().equals("Prepared: Birthday invitation");
		assert new WeddingEvent().prepareInvitation()
				.equals("Prepared: Wedding invitation");

		assert prepareMatchingSet(new WeddingFactory())
				.equals("Wedding invitation + Wedding envelope");
		assert prepareMatchingSet(new BirthdayFactory())
				.equals("Birthday invitation + Birthday envelope");




		log.info("\n");
		log.info("Builder");
		log.info("======================");

		Invitation invitation = new WeddingBuilderInvitation.Builder()
				.recipient("Alice")
				.venue("Rose Hall")
				.theme("Gold")
				.build();

		Invitation weddingBuilderInvitation = new BirthdayBuilderInvitation.Builder()
				.recipient("Johnny")
				.venue("Rose Garden")
				.theme("Yellow")
				.dressCode("Pumpkin")
				.build();
		log.info(invitation.message());
		log.info(weddingBuilderInvitation.message());

//		if (!invitation.message().equals(
//				"Wedding invitation for Alice at Rose Hall | Theme: Gold")) {
//			throw new AssertionError("Builder lost settings");
//		}

	}

}
